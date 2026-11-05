import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';
import { getLang } from '../../common/helpers/lang.helper';
import { assertSessionWithinRound } from '../../common/helpers/round-dates.helper';
import { getTranslatedString } from '../../common/utils/translation.util';
import { RoundSessionEntity } from '../../staff/staff-dashboard/round-sessions/entities/round-session.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { EnrollmentStatusEnum } from '../enrollments/enums/enrollment-status.enum';
import { MeetingStatusEnum } from './enums/meeting-status.enum';
import { MeetingSyncStatusEnum } from './enums/meeting-sync-status.enum';
import {
  GraphAttendee,
  GraphCalendarEventCreatePayload,
  GraphCalendarEventUpdatePayload,
} from './interfaces/graph-calendar-event.interface';
import {
  MicrosoftGraphApiException,
  MicrosoftGraphCalendarService,
} from './services/microsoft-graph-calendar.service';

export interface SyncSessionMeetingOptions {
  title?: string;
  notes?: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  durationMinutes?: number | null;
  timezone?: string;
  status?: MeetingStatusEnum;
  inviteAttendees?: boolean;
  createIfMissing?: boolean;
}

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(
    @InjectRepository(RoundSessionEntity)
    private readonly sessionRepository: Repository<RoundSessionEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
    private readonly graphCalendarService: MicrosoftGraphCalendarService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  private t(key: string): string {
    return this.i18n.t(key, { lang: getLang() });
  }

  /**
   * Determines whether a session creation/update should provision a Teams meeting.
   * - Explicit `createTeamsMeeting: true` -> true
   * - Explicit `createTeamsMeeting: false` -> false
   * - Manual `zoomLink` provided -> false (preserve manual link)
   * - Otherwise, if `TEAMS_ENABLED=true` and `scheduledAt` is provided -> true
   */
  shouldProvisionTeamsMeeting(dto: {
    scheduledAt?: string | Date | null;
    zoomLink?: string | null;
    createTeamsMeeting?: boolean;
  }): boolean {
    if (dto.createTeamsMeeting === true) {
      return true;
    }
    if (dto.createTeamsMeeting === false) {
      return false;
    }
    if (dto.zoomLink) {
      return false;
    }
    const teamsEnabled =
      this.configService.get<boolean>('teams.enabled') === true;
    return Boolean(teamsEnabled && dto.scheduledAt);
  }

  /**
   * Computes dynamic lifecycle status (`scheduled`, `live`, `completed`, `cancelled`) for a session.
   */
  static resolveEffectiveStatus(
    session: Partial<RoundSessionEntity>,
  ): MeetingStatusEnum {
    if (session.meetingStatus === MeetingStatusEnum.CANCELLED) {
      return MeetingStatusEnum.CANCELLED;
    }
    if (session.meetingStatus === MeetingStatusEnum.COMPLETED) {
      return MeetingStatusEnum.COMPLETED;
    }

    const startMs = session.scheduledAt
      ? new Date(session.scheduledAt).getTime()
      : NaN;
    const endMs = session.scheduledEnd
      ? new Date(session.scheduledEnd).getTime()
      : !Number.isNaN(startMs) && session.durationMinutes
        ? startMs + session.durationMinutes * 60_000
        : NaN;

    const now = Date.now();
    if (!Number.isNaN(endMs) && now > endMs) {
      return MeetingStatusEnum.COMPLETED;
    }
    if (
      !Number.isNaN(startMs) &&
      !Number.isNaN(endMs) &&
      now >= startMs &&
      now <= endMs
    ) {
      return MeetingStatusEnum.LIVE;
    }

    return session.meetingStatus ?? MeetingStatusEnum.SCHEDULED;
  }

  /**
   * Validates that an IANA timezone string is recognized by the runtime.
   */
  validateTimezone(timezone: string): string {
    const trimmed = timezone?.trim();
    if (!trimmed) {
      throw new BadRequestException(this.t('errors.INVALID_TIMEZONE'));
    }
    try {
      Intl.DateTimeFormat(undefined, { timeZone: trimmed });
      return trimmed;
    } catch {
      throw new BadRequestException(this.t('errors.INVALID_TIMEZONE'));
    }
  }

  /**
   * Formats a Date instance into a local ISO-8601 timestamp string (`YYYY-MM-DDTHH:mm:ss`)
   * in the given IANA timezone, suitable for Microsoft Graph `{ dateTime, timeZone }`.
   */
  formatDateInTimezone(date: Date, timeZone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });

    const parts = formatter.formatToParts(date);
    const map: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = part.value;
      }
    }

    return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
  }

  computeStartAndEnd(
    startTimeInput?: string | Date | null,
    endTimeInput?: string | Date | null,
    durationMinutesInput?: number | null,
    fallbackScheduledAt?: Date | null,
    fallbackDurationMinutes?: number | null,
  ): { scheduledStart: Date; scheduledEnd: Date; durationMinutes: number } {
    const rawStart = startTimeInput ?? fallbackScheduledAt;
    if (!rawStart) {
      throw new BadRequestException(this.t('errors.MEETING_START_TIME_REQUIRED'));
    }

    const scheduledStart = new Date(rawStart);
    if (Number.isNaN(scheduledStart.getTime())) {
      throw new BadRequestException(this.t('errors.MEETING_INVALID_TIME_RANGE'));
    }

    const defaultDuration =
      this.configService.get<number>('teams.defaultDurationMinutes') || 90;

    if (endTimeInput) {
      const scheduledEnd = new Date(endTimeInput);
      if (
        Number.isNaN(scheduledEnd.getTime()) ||
        scheduledEnd.getTime() <= scheduledStart.getTime()
      ) {
        throw new BadRequestException(
          this.t('errors.MEETING_INVALID_TIME_RANGE'),
        );
      }
      const durationMinutes = Math.max(
        1,
        Math.round(
          (scheduledEnd.getTime() - scheduledStart.getTime()) / 60_000,
        ),
      );
      return { scheduledStart, scheduledEnd, durationMinutes };
    }

    const durationMinutes =
      durationMinutesInput ?? fallbackDurationMinutes ?? defaultDuration;
    if (!durationMinutes || durationMinutes <= 0) {
      throw new BadRequestException(this.t('errors.MEETING_INVALID_TIME_RANGE'));
    }

    const scheduledEnd = new Date(
      scheduledStart.getTime() + durationMinutes * 60_000,
    );
    return { scheduledStart, scheduledEnd, durationMinutes };
  }

  private async loadSessionWithHierarchy(
    sessionId: number,
  ): Promise<RoundSessionEntity> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: {
        round: {
          course: {
            trainer: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(this.t('errors.NOT_FOUND'));
    }

    return session;
  }

  private buildDefaultTitle(session: RoundSessionEntity): string {
    if (session.title?.trim()) {
      return session.title.trim();
    }
    const courseName = session.round?.course?.name
      ? getTranslatedString(session.round.course.name, 'en') ||
        getTranslatedString(session.round.course.name, 'ar')
      : 'Course';
    const roundNum = session.round?.roundNumber ?? 1;
    return `${courseName} - Round ${roundNum} - Session ${session.sessionNumber}`;
  }

  private async buildAttendees(
    session: RoundSessionEntity,
    inviteAttendees = true,
  ): Promise<GraphAttendee[]> {
    if (!inviteAttendees) {
      return [];
    }

    const attendeesMap = new Map<string, GraphAttendee>();
    const trainer = session.round?.course?.trainer;

    if (trainer?.email) {
      const emailKey = trainer.email.trim().toLowerCase();
      attendeesMap.set(emailKey, {
        emailAddress: {
          address: trainer.email.trim(),
          name: `${trainer.firstName ?? ''} ${trainer.lastName ?? ''}`.trim(),
        },
        type: 'required',
      });
    }

    const inviteStudents =
      this.configService.get<boolean>('teams.inviteEnrolledStudents') !== false;

    if (inviteStudents && session.roundId) {
      const enrollments = await this.enrollmentRepository.find({
        where: {
          roundId: session.roundId,
          status: In([
            EnrollmentStatusEnum.ACTIVE,
            EnrollmentStatusEnum.PENDING,
          ]),
        },
        relations: { student: true },
      });

      for (const enrollment of enrollments) {
        const student = enrollment.student;
        if (student?.email) {
          const emailKey = student.email.trim().toLowerCase();
          if (!attendeesMap.has(emailKey)) {
            attendeesMap.set(emailKey, {
              emailAddress: {
                address: student.email.trim(),
                name: `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim(),
              },
              type: 'required',
            });
          }
        }
      }
    }

    return Array.from(attendeesMap.values());
  }

  private mapGraphExceptionToHttp(error: unknown): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    if (error instanceof MicrosoftGraphApiException) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return new BadGatewayException(
          this.t('errors.TEAMS_GRAPH_AUTH_FAILED'),
        );
      }
      if (error.statusCode === 429) {
        return new HttpException(
          this.t('errors.TEAMS_GRAPH_RATE_LIMITED'),
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (error.statusCode === 504) {
        return new ServiceUnavailableException(
          this.t('errors.TEAMS_GRAPH_TIMEOUT'),
        );
      }
      return new BadGatewayException(this.t('errors.TEAMS_GRAPH_FAILED'));
    }

    return new InternalServerErrorException(this.t('errors.SERVER_ERROR'));
  }

  /**
   * Provisions a Microsoft Teams online meeting directly on a `RoundSessionEntity`.
   * - Idempotent: if the session already has a `SYNCED` non-cancelled Teams meeting, returns it immediately.
   * - Locks the session with `syncStatus = PENDING` during the Graph call.
   * - Compensates by cancelling the remote Graph event if local persistence fails after Graph creation.
   */
  async createOrSyncSessionMeeting(
    sessionId: number,
    options?: SyncSessionMeetingOptions,
  ): Promise<RoundSessionEntity> {
    const session = await this.loadSessionWithHierarchy(sessionId);

    // Idempotent check: already synced and active
    if (
      session.meetingStatus !== MeetingStatusEnum.CANCELLED &&
      session.syncStatus === MeetingSyncStatusEnum.SYNCED &&
      session.microsoftEventId &&
      session.zoomLink
    ) {
      return session;
    }

    if (session.syncStatus === MeetingSyncStatusEnum.PENDING) {
      throw new ConflictException(this.t('errors.MEETING_SYNC_IN_PROGRESS'));
    }

    const defaultTimezone =
      this.configService.get<string>('teams.defaultTimezone') || 'Asia/Riyadh';
    const timezone = this.validateTimezone(
      options?.timezone || session.timezone || defaultTimezone,
    );

    const { scheduledStart, scheduledEnd, durationMinutes } =
      this.computeStartAndEnd(
        options?.startTime,
        options?.endTime,
        options?.durationMinutes,
        session.scheduledAt,
        session.durationMinutes,
      );

    if (session.round) {
      assertSessionWithinRound(scheduledStart, session.round);
    }

    const title = options?.title?.trim() || this.buildDefaultTitle(session);
    const notes =
      options?.notes !== undefined ? options.notes : (session.notes ?? '');

    // Mark session as PENDING before calling Microsoft Graph
    session.title = title;
    session.notes = notes;
    session.scheduledAt = scheduledStart;
    session.scheduledEnd = scheduledEnd;
    session.durationMinutes = durationMinutes;
    session.timezone = timezone;
    session.meetingStatus = MeetingStatusEnum.SCHEDULED;
    session.syncStatus = MeetingSyncStatusEnum.PENDING;
    session.syncError = null;
    await this.sessionRepository.save(session);

    const organizerUserId = this.graphCalendarService.getOrganizerUserId();
    const attendees = await this.buildAttendees(
      session,
      options?.inviteAttendees ?? true,
    );

    const payload: GraphCalendarEventCreatePayload = {
      subject: title,
      body: {
        contentType: 'HTML',
        content: notes ? `<p>${this.escapeHtml(notes)}</p>` : '',
      },
      start: {
        dateTime: this.formatDateInTimezone(scheduledStart, timezone),
        timeZone: timezone,
      },
      end: {
        dateTime: this.formatDateInTimezone(scheduledEnd, timezone),
        timeZone: timezone,
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
      attendees,
      transactionId: `tnzeem-round-session-${session.id}`,
    };

    let graphEventId: string | null = null;
    let joinUrl: string | null = null;
    let onlineMeetingId: string | null = null;

    try {
      const graphEvent =
        await this.graphCalendarService.createOnlineMeetingEvent(
          payload,
          organizerUserId,
        );

      graphEventId = graphEvent.id;
      joinUrl =
        graphEvent.onlineMeeting?.joinUrl ||
        graphEvent.onlineMeetingUrl ||
        null;
      onlineMeetingId =
        graphEvent.onlineMeeting?.conferenceId ||
        graphEvent.iCalUId ||
        graphEvent.id;

      if (!joinUrl) {
        throw new MicrosoftGraphApiException(
          'Microsoft Graph did not return a Teams join URL',
          502,
          'missing_join_url',
        );
      }
    } catch (graphError: any) {
      if (graphEventId) {
        try {
          await this.graphCalendarService.cancelOnlineMeetingEvent(
            graphEventId,
            'Cancelled due to missing Teams join URL',
            organizerUserId,
          );
        } catch (cleanupErr: any) {
          this.logger.error(
            `Failed to cancel incomplete Graph event ${graphEventId}: ${cleanupErr?.message}`,
          );
        }
      }

      session.syncStatus = MeetingSyncStatusEnum.FAILED;
      session.syncError =
        graphError?.message || 'Microsoft Graph synchronization failed';
      await this.sessionRepository.save(session);

      throw this.mapGraphExceptionToHttp(graphError);
    }

    // Persist synchronized metadata onto the RoundSessionEntity.
    // If local persistence fails, compensate by cancelling the created Graph event.
    try {
      session.microsoftEventId = graphEventId;
      session.microsoftOnlineMeetingId = onlineMeetingId;
      session.zoomLink = joinUrl;
      session.organizerUserId = organizerUserId;
      session.meetingStatus = MeetingStatusEnum.SCHEDULED;
      session.syncStatus = MeetingSyncStatusEnum.SYNCED;
      session.syncError = null;
      session.lastSyncedAt = new Date();

      return await this.sessionRepository.save(session);
    } catch (persistenceError: any) {
      this.logger.error(
        `Local persistence failed after Graph event ${graphEventId} creation for session ${session.id}; compensating by cancelling Graph event: ${persistenceError?.message}`,
      );
      try {
        await this.graphCalendarService.cancelOnlineMeetingEvent(
          graphEventId,
          'Cancelled automatically due to local persistence rollback',
          organizerUserId,
        );
      } catch (rollbackErr: any) {
        this.logger.error(
          `Compensating cancellation for Graph event ${graphEventId} failed: ${rollbackErr?.message}`,
        );
      }

      throw new InternalServerErrorException(
        this.t('errors.MEETING_PERSISTENCE_FAILED'),
      );
    }
  }

  /**
   * Synchronizes changes to a `RoundSessionEntity` with Microsoft Graph.
   */
  async updateSessionMeeting(
    sessionId: number,
    options?: SyncSessionMeetingOptions,
  ): Promise<RoundSessionEntity> {
    const session = await this.loadSessionWithHierarchy(sessionId);

    if (options?.status === MeetingStatusEnum.CANCELLED) {
      return await this.cancelSessionMeeting(sessionId);
    }

    // If this session does not have a Graph event yet
    if (!session.microsoftEventId) {
      if (options?.createIfMissing) {
        return await this.createOrSyncSessionMeeting(sessionId, options);
      }
      return session;
    }

    if (session.meetingStatus === MeetingStatusEnum.CANCELLED) {
      throw new BadRequestException(
        this.t('errors.MEETING_ALREADY_CANCELLED'),
      );
    }

    const defaultTimezone =
      this.configService.get<string>('teams.defaultTimezone') || 'Asia/Riyadh';
    const timezone = this.validateTimezone(
      options?.timezone || session.timezone || defaultTimezone,
    );

    const { scheduledStart, scheduledEnd, durationMinutes } =
      this.computeStartAndEnd(
        options?.startTime,
        options?.endTime,
        options?.durationMinutes,
        session.scheduledAt,
        session.durationMinutes,
      );

    if (session.round) {
      assertSessionWithinRound(scheduledStart, session.round);
    }

    const nextTitle =
      options?.title !== undefined
        ? options.title.trim() || this.buildDefaultTitle(session)
        : this.buildDefaultTitle(session);
    const nextNotes =
      options?.notes !== undefined ? options.notes : (session.notes ?? '');

    const updatePayload: GraphCalendarEventUpdatePayload = {
      subject: nextTitle,
      body: {
        contentType: 'HTML',
        content: nextNotes ? `<p>${this.escapeHtml(nextNotes)}</p>` : '',
      },
      start: {
        dateTime: this.formatDateInTimezone(scheduledStart, timezone),
        timeZone: timezone,
      },
      end: {
        dateTime: this.formatDateInTimezone(scheduledEnd, timezone),
        timeZone: timezone,
      },
    };

    if (options?.inviteAttendees !== undefined) {
      updatePayload.attendees = await this.buildAttendees(
        session,
        options.inviteAttendees,
      );
    }

    try {
      const updatedGraphEvent =
        await this.graphCalendarService.updateOnlineMeetingEvent(
          session.microsoftEventId,
          updatePayload,
          session.organizerUserId,
        );

      const updatedJoinUrl =
        updatedGraphEvent?.onlineMeeting?.joinUrl ||
        updatedGraphEvent?.onlineMeetingUrl ||
        session.zoomLink;

      session.title = nextTitle;
      session.notes = nextNotes;
      session.scheduledAt = scheduledStart;
      session.scheduledEnd = scheduledEnd;
      session.durationMinutes = durationMinutes;
      session.timezone = timezone;
      if (options?.status) {
        session.meetingStatus = options.status;
      }
      if (updatedJoinUrl) {
        session.zoomLink = updatedJoinUrl;
      }
      session.syncStatus = MeetingSyncStatusEnum.SYNCED;
      session.syncError = null;
      session.lastSyncedAt = new Date();

      return await this.sessionRepository.save(session);
    } catch (graphError: any) {
      session.syncStatus = MeetingSyncStatusEnum.FAILED;
      session.syncError =
        graphError?.message || 'Microsoft Graph update failed';
      await this.sessionRepository.save(session);

      throw this.mapGraphExceptionToHttp(graphError);
    }
  }

  /**
   * Retries synchronization with Microsoft Graph for a session whose previous sync failed,
   * or refreshes the attendee list on an existing session meeting.
   */
  async resyncSessionMeeting(sessionId: number): Promise<RoundSessionEntity> {
    const session = await this.loadSessionWithHierarchy(sessionId);

    if (session.meetingStatus === MeetingStatusEnum.CANCELLED) {
      throw new BadRequestException(
        this.t('errors.MEETING_ALREADY_CANCELLED'),
      );
    }

    if (!session.microsoftEventId) {
      return await this.createOrSyncSessionMeeting(sessionId, {
        inviteAttendees: true,
      });
    }

    return await this.updateSessionMeeting(sessionId, {
      inviteAttendees: true,
    });
  }

  /**
   * Cancels the Microsoft Teams meeting associated with a `RoundSessionEntity` in Microsoft Graph
   * and updates the session's meeting status and join link consistently.
   */
  async cancelSessionMeeting(sessionId: number): Promise<RoundSessionEntity> {
    const session = await this.loadSessionWithHierarchy(sessionId);

    if (
      session.meetingStatus === MeetingStatusEnum.CANCELLED &&
      session.syncStatus === MeetingSyncStatusEnum.CANCELLED
    ) {
      return session;
    }

    if (session.microsoftEventId) {
      try {
        await this.graphCalendarService.cancelOnlineMeetingEvent(
          session.microsoftEventId,
          `Session "${session.title || session.sessionNumber}" has been cancelled.`,
          session.organizerUserId,
        );
      } catch (graphError: any) {
        session.syncStatus = MeetingSyncStatusEnum.FAILED;
        session.syncError =
          graphError?.message || 'Microsoft Graph cancellation failed';
        await this.sessionRepository.save(session);
        throw this.mapGraphExceptionToHttp(graphError);
      }
    }

    session.meetingStatus = MeetingStatusEnum.CANCELLED;
    session.syncStatus = MeetingSyncStatusEnum.CANCELLED;
    session.zoomLink = null as unknown as string;
    session.syncError = null;
    session.lastSyncedAt = new Date();

    return await this.sessionRepository.save(session);
  }

  private escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
