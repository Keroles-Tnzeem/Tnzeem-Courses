import { assertSessionWithinRound } from '../../../common/helpers/round-dates.helper';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { RoundSessionEntity } from '../../staff-dashboard/round-sessions/entities/round-session.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { CreateSessionRequest } from './dto/requests/create-session.request';
import { UpdateSessionRequest } from './dto/requests/update-session.request';
import { QuerySessionRequest } from './dto/requests/query-session.request';
import { getLang } from '../../../common/helpers/lang.helper';
import { MeetingsService } from '../../../shared/meetings/meetings.service';
import { MeetingStatusEnum } from '../../../shared/meetings/enums/meeting-status.enum';

@Injectable()
export class InstructorSessionsService {
  constructor(
    @InjectRepository(RoundSessionEntity)
    private readonly sessionRepo: Repository<RoundSessionEntity>,
    @InjectRepository(RoundEntity)
    private readonly roundRepo: Repository<RoundEntity>,
    private readonly i18n: I18nService,
    @Optional()
    private readonly meetingsService?: MeetingsService,
  ) {}

  private async verifyRoundOwnership(roundId: number, trainerId: number): Promise<RoundEntity> {
    const round = await this.roundRepo
      .createQueryBuilder('round')
      .innerJoin('round.course', 'course')
      .where('round.id = :roundId', { roundId })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .getOne();

    if (!round) {
      throw new NotFoundException(
        this.i18n.t('errors.ROUND_NOT_FOUND', { lang: getLang() }) || 'Round not found or access denied',
      );
    }
    return round;
  }

  async create(trainerId: number, dto: CreateSessionRequest): Promise<RoundSessionEntity> {
    const round = await this.verifyRoundOwnership(dto.roundId, trainerId);

    const timezone =
      dto.timezone && this.meetingsService
        ? this.meetingsService.validateTimezone(dto.timezone)
        : dto.timezone || 'Asia/Riyadh';

    let scheduledAt: Date | undefined;
    let scheduledEnd: Date | undefined;
    let durationMinutes = dto.durationMinutes;

    if (dto.scheduledAt || dto.endTime) {
      if (this.meetingsService) {
        const computed = this.meetingsService.computeStartAndEnd(
          dto.scheduledAt,
          dto.endTime,
          dto.durationMinutes,
        );
        scheduledAt = computed.scheduledStart;
        scheduledEnd = computed.scheduledEnd;
        durationMinutes = computed.durationMinutes;
      } else if (dto.scheduledAt) {
        scheduledAt = new Date(dto.scheduledAt);
        if (dto.durationMinutes) {
          scheduledEnd = new Date(
            scheduledAt.getTime() + dto.durationMinutes * 60_000,
          );
        }
      }
    }

    if (scheduledAt) {
      assertSessionWithinRound(scheduledAt, round);
    }

    const duplicate = await this.sessionRepo.findOne({
      where: { roundId: dto.roundId, sessionNumber: dto.sessionNumber },
    });
    if (duplicate) {
      throw new BadRequestException(
        this.i18n.t('errors.SESSION_NUMBER_TAKEN', { lang: getLang() }) ||
          'Session number already exists for this round',
      );
    }

    const entity = this.sessionRepo.create({
      roundId: dto.roundId,
      sessionNumber: dto.sessionNumber,
      title: dto.title,
      scheduledAt,
      scheduledEnd,
      timezone,
      zoomLink: dto.zoomLink,
      durationMinutes,
      notes: dto.notes,
      meetingStatus: MeetingStatusEnum.SCHEDULED,
    });

    const saved = await this.sessionRepo.save(entity);

    if (
      this.meetingsService &&
      this.meetingsService.shouldProvisionTeamsMeeting({
        scheduledAt,
        zoomLink: dto.zoomLink,
        createTeamsMeeting: dto.createTeamsMeeting,
      })
    ) {
      return await this.meetingsService.createOrSyncSessionMeeting(saved.id, {
        title: dto.title,
        notes: dto.notes,
        startTime: scheduledAt,
        endTime: scheduledEnd,
        durationMinutes,
        timezone,
        inviteAttendees: dto.inviteAttendees ?? true,
      });
    }

    return saved;
  }

  /** Sessions of one round; 404 when the round is not the trainer's own. */
  async findByRound(
    trainerId: number,
    roundId: number,
    query: QuerySessionRequest,
  ): Promise<{ data: RoundSessionEntity[]; total: number }> {
    await this.verifyRoundOwnership(roundId, trainerId);
    query.roundId = roundId;
    return this.findAll(trainerId, query);
  }

  async findAll(
    trainerId: number,
    query: QuerySessionRequest,
  ): Promise<{ data: RoundSessionEntity[]; total: number }> {
    const {
      limit = 10,
      roundId,
      courseId,
      meetingStatus,
      syncStatus,
      upcomingOnly,
      sortBy = 'session_number',
      sortOrder = 'ASC',
    } = query;
    const offset = query.page ? (query.page - 1) * limit : (query.offset ?? 0);

    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .innerJoin('session.round', 'round')
      .innerJoin('round.course', 'course')
      .where('course.trainer_id = :trainerId', { trainerId });

    if (roundId) {
      qb.andWhere('session.round_id = :roundId', { roundId });
    }
    if (courseId) {
      qb.andWhere('round.course_id = :courseId', { courseId });
    }
    if (meetingStatus) {
      qb.andWhere('session.meeting_status = :meetingStatus', { meetingStatus });
    }
    if (syncStatus) {
      qb.andWhere('session.sync_status = :syncStatus', { syncStatus });
    }
    if (upcomingOnly) {
      qb.andWhere('session.meeting_status != :cancelledStatus', {
        cancelledStatus: MeetingStatusEnum.CANCELLED,
      }).andWhere(
        '(session.scheduled_end >= :now OR (session.scheduled_end IS NULL AND session.scheduled_at >= :now))',
        { now: new Date() },
      );
    }

    const sortMap: Record<string, string> = {
      session_number: 'session.sessionNumber',
      scheduled_at: 'session.scheduledAt',
      created_at: 'session.audit.createdAt',
    };

    qb.orderBy(sortMap[sortBy] ?? 'session.sessionNumber', sortOrder as 'ASC' | 'DESC');

    const [entities, total] = await qb.skip(offset).take(limit).getManyAndCount();
    return { data: entities, total };
  }

  async findOne(trainerId: number, id: number): Promise<RoundSessionEntity> {
    const entity = await this.sessionRepo
      .createQueryBuilder('session')
      .innerJoin('session.round', 'round')
      .innerJoin('round.course', 'course')
      .where('session.id = :id', { id })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) || 'Session not found',
      );
    }
    return entity;
  }

  async update(trainerId: number, id: number, dto: UpdateSessionRequest): Promise<RoundSessionEntity> {
    const entity = await this.findOne(trainerId, id);

    if (dto.sessionNumber && dto.sessionNumber !== entity.sessionNumber) {
      const duplicate = await this.sessionRepo.findOne({
        where: { roundId: entity.roundId, sessionNumber: dto.sessionNumber },
      });
      if (duplicate) {
        throw new BadRequestException(
          this.i18n.t('errors.SESSION_NUMBER_TAKEN', { lang: getLang() }) ||
            'Session number already taken',
        );
      }
      entity.sessionNumber = dto.sessionNumber;
    }

    if (dto.timezone !== undefined) {
      entity.timezone = this.meetingsService
        ? this.meetingsService.validateTimezone(dto.timezone)
        : dto.timezone;
    }

    if (dto.scheduledAt !== undefined || dto.endTime !== undefined || dto.durationMinutes !== undefined) {
      const nextStartRaw =
        dto.scheduledAt !== undefined
          ? dto.scheduledAt
            ? new Date(dto.scheduledAt)
            : null
          : entity.scheduledAt;

      if (nextStartRaw && this.meetingsService) {
        const computed = this.meetingsService.computeStartAndEnd(
          nextStartRaw,
          dto.endTime,
          dto.durationMinutes,
          entity.scheduledAt,
          entity.durationMinutes,
        );
        const round = await this.roundRepo.findOne({
          where: { id: entity.roundId },
        });
        if (round) assertSessionWithinRound(computed.scheduledStart, round);

        entity.scheduledAt = computed.scheduledStart;
        entity.scheduledEnd = computed.scheduledEnd;
        entity.durationMinutes = computed.durationMinutes;
      } else {
        if (dto.scheduledAt !== undefined) {
          const nextDate = dto.scheduledAt
            ? new Date(dto.scheduledAt)
            : (null as unknown as Date);
          if (nextDate) {
            const round = await this.roundRepo.findOne({
              where: { id: entity.roundId },
            });
            if (round) assertSessionWithinRound(nextDate, round);
          }
          entity.scheduledAt = nextDate;
        }
        if (dto.durationMinutes !== undefined) {
          entity.durationMinutes = dto.durationMinutes;
        }
      }
    }

    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.zoomLink !== undefined) entity.zoomLink = dto.zoomLink;
    if (dto.notes !== undefined) entity.notes = dto.notes;
    if (dto.meetingStatus !== undefined && !entity.microsoftEventId) {
      entity.meetingStatus = dto.meetingStatus;
    }

    const saved = await this.sessionRepo.save(entity);

    if (
      this.meetingsService &&
      (saved.microsoftEventId || dto.createTeamsMeeting)
    ) {
      return await this.meetingsService.updateSessionMeeting(saved.id, {
        title: saved.title,
        notes: saved.notes,
        startTime: saved.scheduledAt,
        endTime: saved.scheduledEnd,
        durationMinutes: saved.durationMinutes,
        timezone: saved.timezone,
        status: dto.meetingStatus,
        inviteAttendees: dto.inviteAttendees,
        createIfMissing: dto.createTeamsMeeting ?? false,
      });
    }

    return saved;
  }

  async resyncMeeting(trainerId: number, id: number): Promise<RoundSessionEntity> {
    const entity = await this.findOne(trainerId, id);
    if (!this.meetingsService) {
      return entity;
    }
    return await this.meetingsService.resyncSessionMeeting(entity.id);
  }

  async cancelMeeting(trainerId: number, id: number): Promise<RoundSessionEntity> {
    const entity = await this.findOne(trainerId, id);
    if (!this.meetingsService) {
      entity.meetingStatus = MeetingStatusEnum.CANCELLED;
      entity.zoomLink = null as unknown as string;
      return await this.sessionRepo.save(entity);
    }
    return await this.meetingsService.cancelSessionMeeting(entity.id);
  }

  async remove(trainerId: number, id: number): Promise<void> {
    const entity = await this.findOne(trainerId, id);

    if (this.meetingsService && entity.microsoftEventId) {
      await this.meetingsService.cancelSessionMeeting(entity.id);
    }

    await this.sessionRepo.softDelete(entity.id);
  }
}
