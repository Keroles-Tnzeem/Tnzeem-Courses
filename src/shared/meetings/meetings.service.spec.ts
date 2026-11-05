import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InstructorSessionsService } from '../../staff/instructor-dashboard/sessions/sessions.service';
import { SessionResponse } from '../../staff/instructor-dashboard/sessions/dto/responses/session.response';
import { RoundSessionResponse } from '../../staff/staff-dashboard/round-sessions/dto/responses/round-session.response';
import { RoundSessionEntity } from '../../staff/staff-dashboard/round-sessions/entities/round-session.entity';
import { RoundSessionsService } from '../../staff/staff-dashboard/round-sessions/round-sessions.service';
import { StudentEnrollmentDetailsResponse } from '../../website/student/enrollments/dto/responses/student-enrollment-details.response';
import { EnrollmentStatusEnum } from '../enrollments/enums/enrollment-status.enum';
import { MeetingStatusEnum } from './enums/meeting-status.enum';
import { MeetingSyncStatusEnum } from './enums/meeting-sync-status.enum';
import { MeetingsService } from './meetings.service';
import { MicrosoftGraphAuthService } from './services/microsoft-graph-auth.service';
import {
  MicrosoftGraphApiException,
  MicrosoftGraphCalendarService,
} from './services/microsoft-graph-calendar.service';

describe('RoundSession Microsoft Teams Integration (MeetingsService + RoundSessionsService + InstructorSessionsService)', () => {
  const sampleRound = () => ({
    id: 11,
    courseId: 5,
    roundNumber: 2,
    startDate: new Date('2026-11-01'),
    endDate: new Date('2026-12-01'),
    course: {
      id: 5,
      trainerId: 10,
      name: { en: 'TypeScript Mastery', ar: 'إتقان تايب سكريبت' },
      trainer: {
        id: 10,
        firstName: 'Ahmad',
        lastName: 'Trainer',
        email: 'trainer10@tnzeem.com',
      },
    },
  });

  const buildHarness = (teamsEnabled = true) => {
    const sessionsStore = new Map<number, RoundSessionEntity>();
    let nextSessionId = 101;

    const seedSession = (overrides?: Partial<RoundSessionEntity>): RoundSessionEntity => {
      const entity: RoundSessionEntity = {
        id: 101,
        roundId: 11,
        sessionNumber: 1,
        title: 'Intro to TypeScript',
        scheduledAt: new Date('2026-11-15T15:00:00.000Z'),
        scheduledEnd: new Date('2026-11-15T16:30:00.000Z'),
        timezone: 'Asia/Riyadh',
        durationMinutes: 90,
        notes: 'Bring your IDE',
        zoomLink: null as unknown as string,
        meetingStatus: MeetingStatusEnum.SCHEDULED,
        syncStatus: null,
        syncError: null,
        microsoftEventId: null,
        microsoftOnlineMeetingId: null,
        organizerUserId: null,
        lastSyncedAt: null,
        round: sampleRound() as any,
        audit: { createdAt: new Date(), updatedAt: new Date() } as any,
        deletedAt: null as unknown as Date,
        ...overrides,
      };
      sessionsStore.set(entity.id, entity);
      return entity;
    };

    seedSession();

    const sessionRepository = {
      findOne: jest.fn(async ({ where }: any) => {
        if (where?.id !== undefined) {
          return sessionsStore.get(where.id) ?? null;
        }
        if (where?.roundId !== undefined && where?.sessionNumber !== undefined) {
          for (const s of sessionsStore.values()) {
            if (
              s.roundId === where.roundId &&
              s.sessionNumber === where.sessionNumber
            ) {
              return s;
            }
          }
          return null;
        }
        return null;
      }),
      create: jest.fn((partial: Partial<RoundSessionEntity>) => ({
        ...partial,
        meetingStatus: partial.meetingStatus ?? MeetingStatusEnum.SCHEDULED,
        timezone: partial.timezone ?? 'Asia/Riyadh',
        round: sampleRound() as any,
        audit: { createdAt: new Date(), updatedAt: new Date() },
      })),
      save: jest.fn(async (entity: RoundSessionEntity) => {
        if (!entity.id) {
          entity.id = ++nextSessionId;
        }
        const saved: RoundSessionEntity = {
          ...entity,
          round: entity.round ?? (sampleRound() as any),
          audit: entity.audit ?? ({ createdAt: new Date(), updatedAt: new Date() } as any),
        };
        sessionsStore.set(saved.id, saved);
        return saved;
      }),
      softDelete: jest.fn(async (id: number) => {
        sessionsStore.delete(id);
      }),
    };

    const roundRepository = {
      findOne: jest.fn(async ({ where }: any) => {
        if (where?.id === 11) return sampleRound();
        return null;
      }),
      createQueryBuilder: jest.fn(() => {
        const filters: Record<string, any> = {};
        const qb: any = {
          innerJoin: jest.fn().mockReturnThis(),
          where: jest.fn((_q: string, p: any) => {
            Object.assign(filters, p);
            return qb;
          }),
          andWhere: jest.fn((_q: string, p: any) => {
            Object.assign(filters, p);
            return qb;
          }),
          getOne: jest.fn(async () => {
            if (filters.roundId === 11 && filters.trainerId === 10) {
              return sampleRound();
            }
            return null;
          }),
        };
        return qb;
      }),
    };

    const enrollmentRepository = {
      find: jest.fn(async () => [
        {
          id: '01JTEST',
          studentId: 50,
          roundId: 11,
          status: EnrollmentStatusEnum.ACTIVE,
          student: {
            id: 50,
            firstName: 'Sara',
            lastName: 'Student',
            email: 'student50@tnzeem.com',
          },
        },
      ]),
    };

    const graphCalendarService = {
      getOrganizerUserId: jest.fn(() => 'organizer@tnzeem.com'),
      createOnlineMeetingEvent: jest.fn(async () => ({
        id: 'graph-event-123',
        iCalUId: 'ical-123',
        onlineMeeting: {
          joinUrl: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc',
          conferenceId: 'conf-987654',
        },
      })),
      updateOnlineMeetingEvent: jest.fn(async () => ({
        id: 'graph-event-123',
        onlineMeeting: {
          joinUrl: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc',
        },
      })),
      cancelOnlineMeetingEvent: jest.fn(async () => undefined),
      getOnlineMeetingEvent: jest.fn(),
    };

    const configValues: Record<string, any> = {
      'teams.enabled': teamsEnabled,
      'teams.defaultTimezone': 'Asia/Riyadh',
      'teams.defaultDurationMinutes': 90,
      'teams.inviteEnrolledStudents': true,
      'teams.organizerUserId': 'organizer@tnzeem.com',
    };

    const configService = {
      get: jest.fn((key: string) => configValues[key]),
    } as unknown as ConfigService;

    const i18n = {
      t: jest.fn((key: string) => key),
    };

    const meetingsService = new MeetingsService(
      sessionRepository as any,
      enrollmentRepository as any,
      graphCalendarService as any,
      configService,
      i18n as any,
    );

    const roundSessionsService = new RoundSessionsService(
      sessionRepository as any,
      roundRepository as any,
      i18n as any,
      meetingsService,
    );

    const instructorSessionsService = new InstructorSessionsService(
      sessionRepository as any,
      roundRepository as any,
      i18n as any,
      meetingsService,
    );

    return {
      meetingsService,
      roundSessionsService,
      instructorSessionsService,
      sessionRepository,
      roundRepository,
      graphCalendarService,
      sessionsStore,
      seedSession,
    };
  };

  describe('1. Successful session & Microsoft Teams meeting creation and DTO mapping', () => {
    it('provisions a Teams meeting directly on RoundSessionEntity when creating a session', async () => {
      const { roundSessionsService, graphCalendarService } = buildHarness(true);

      const created = await roundSessionsService.create({
        roundId: 11,
        sessionNumber: 2,
        title: 'Generics & Utility Types',
        scheduledAt: '2026-11-16T15:00:00.000Z',
        durationMinutes: 90,
        timezone: 'Asia/Riyadh',
        notes: 'Deep dive into generics',
      });

      expect(created.meetingStatus).toBe(MeetingStatusEnum.SCHEDULED);
      expect(created.syncStatus).toBe(MeetingSyncStatusEnum.SYNCED);
      expect(created.microsoftEventId).toBe('graph-event-123');
      expect(created.microsoftOnlineMeetingId).toBe('conf-987654');
      expect(created.zoomLink).toBe(
        'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc',
      );
      expect(created.organizerUserId).toBe('organizer@tnzeem.com');

      expect(
        graphCalendarService.createOnlineMeetingEvent,
      ).toHaveBeenCalledTimes(1);
      const [payload, organizer] = (
        graphCalendarService.createOnlineMeetingEvent as jest.Mock
      ).mock.calls[0];
      expect(organizer).toBe('organizer@tnzeem.com');
      expect(payload.isOnlineMeeting).toBe(true);
      expect(payload.onlineMeetingProvider).toBe('teamsForBusiness');
      // 15:00 UTC in Asia/Riyadh (UTC+3) is 18:00 local time
      expect(payload.start).toEqual({
        dateTime: '2026-11-16T18:00:00',
        timeZone: 'Asia/Riyadh',
      });
      expect(payload.end).toEqual({
        dateTime: '2026-11-16T19:30:00',
        timeZone: 'Asia/Riyadh',
      });
      expect(payload.attendees).toHaveLength(2);

      // Verify Staff, Instructor, and Student response DTOs map fields directly on the session
      const staffDto = RoundSessionResponse.from(created);
      expect(staffDto.zoomLink).toBe(
        'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc',
      );
      expect(staffDto.isJoinable).toBe(true);
      expect(staffDto.meetingStatus).toBe(MeetingStatusEnum.SCHEDULED);
      expect(staffDto.microsoftEventId).toBe('graph-event-123');

      const instructorDto = SessionResponse.fromEntity(created);
      expect(instructorDto.zoomLink).toBe(
        'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc',
      );
      expect(instructorDto.isJoinable).toBe(true);

      const studentEnrollmentDto = StudentEnrollmentDetailsResponse.fromEntity(
        {
          id: '01JENR',
          studentId: 50,
          roundId: 11,
          status: EnrollmentStatusEnum.ACTIVE,
          round: {
            ...sampleRound(),
            sessions: [created],
          },
          audit: { createdAt: new Date(), updatedAt: new Date() },
        } as any,
        'en',
      );
      expect(studentEnrollmentDto.round?.sessions[0].zoomLink).toBe(
        'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc',
      );
      expect(studentEnrollmentDto.round?.sessions[0].isJoinable).toBe(true);
    });
  });

  describe('2. Invalid input, timezones, and date ranges', () => {
    it('rejects an invalid IANA timezone identifier', async () => {
      const { roundSessionsService } = buildHarness(true);

      await expect(
        roundSessionsService.create({
          roundId: 11,
          sessionNumber: 3,
          scheduledAt: '2026-11-16T15:00:00Z',
          timezone: 'Invalid/Timezone_Name',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when endTime is earlier than or equal to scheduledAt', async () => {
      const { roundSessionsService } = buildHarness(true);

      await expect(
        roundSessionsService.create({
          roundId: 11,
          sessionNumber: 3,
          scheduledAt: '2026-11-16T18:00:00Z',
          endTime: '2026-11-16T17:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when scheduledAt is outside the round startDate and endDate', async () => {
      const { roundSessionsService } = buildHarness(true);

      await expect(
        roundSessionsService.create({
          roundId: 11,
          sessionNumber: 3,
          scheduledAt: '2027-05-01T18:00:00Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects provisioning a Teams meeting when scheduledAt is missing', async () => {
      const { meetingsService, seedSession } = buildHarness(true);
      seedSession({ id: 102, scheduledAt: null as unknown as Date });

      await expect(
        meetingsService.createOrSyncSessionMeeting(102),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('3. Instructor ownership authorization', () => {
    it('allows owning trainer (trainerId=10) and forbids non-owning trainer (trainerId=99)', async () => {
      const { instructorSessionsService } = buildHarness(true);

      await expect(
        instructorSessionsService.create(99, {
          roundId: 11,
          sessionNumber: 4,
          scheduledAt: '2026-11-17T15:00:00Z',
        }),
      ).rejects.toThrow(NotFoundException);

      const created = await instructorSessionsService.create(10, {
        roundId: 11,
        sessionNumber: 4,
        scheduledAt: '2026-11-17T15:00:00Z',
      });
      expect(created.syncStatus).toBe(MeetingSyncStatusEnum.SYNCED);
    });
  });

  describe('4. Duplicate requests and idempotent retries on a session', () => {
    it('returns the already-synced session without calling Graph again on duplicate sync', async () => {
      const { meetingsService, graphCalendarService } = buildHarness(true);

      const first = await meetingsService.createOrSyncSessionMeeting(101);
      const second = await meetingsService.createOrSyncSessionMeeting(101);

      expect(second.id).toBe(first.id);
      expect(
        graphCalendarService.createOnlineMeetingEvent,
      ).toHaveBeenCalledTimes(1);
    });

    it('throws 409 ConflictException when another request for the same session is PENDING', async () => {
      const { meetingsService, seedSession } = buildHarness(true);
      seedSession({
        id: 101,
        syncStatus: MeetingSyncStatusEnum.PENDING,
      });

      await expect(
        meetingsService.createOrSyncSessionMeeting(101),
      ).rejects.toThrow(ConflictException);
    });

    it('safely retries and synchronizes the session when a previous attempt FAILED', async () => {
      const { meetingsService, graphCalendarService } = buildHarness(true);

      graphCalendarService.createOnlineMeetingEvent.mockRejectedValueOnce(
        new MicrosoftGraphApiException(
          'Temporary timeout',
          504,
          'timeout',
          true,
        ),
      );

      await expect(
        meetingsService.createOrSyncSessionMeeting(101),
      ).rejects.toThrow(ServiceUnavailableException);

      const recovered = await meetingsService.resyncSessionMeeting(101);
      expect(recovered.syncStatus).toBe(MeetingSyncStatusEnum.SYNCED);
      expect(recovered.syncError).toBeNull();
      expect(recovered.zoomLink).toBe(
        'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc',
      );
    });
  });

  describe('5. Session updates and cancellation', () => {
    it('updates the Microsoft Graph event when the session schedule or title is updated', async () => {
      const { roundSessionsService, graphCalendarService } = buildHarness(true);

      await roundSessionsService.resyncMeeting(101);

      const updated = await roundSessionsService.update(101, {
        title: 'Updated TypeScript Session',
        scheduledAt: '2026-11-18T16:00:00Z',
        durationMinutes: 120,
      });

      expect(updated.title).toBe('Updated TypeScript Session');
      expect(updated.durationMinutes).toBe(120);
      expect(
        graphCalendarService.updateOnlineMeetingEvent,
      ).toHaveBeenCalledWith(
        'graph-event-123',
        expect.objectContaining({
          subject: 'Updated TypeScript Session',
        }),
        'organizer@tnzeem.com',
      );
    });

    it('cancels the Teams meeting in Graph, marks meetingStatus CANCELLED, and clears zoomLink', async () => {
      const { roundSessionsService, graphCalendarService } = buildHarness(true);

      await roundSessionsService.resyncMeeting(101);
      const cancelled = await roundSessionsService.cancelMeeting(101);

      expect(cancelled.meetingStatus).toBe(MeetingStatusEnum.CANCELLED);
      expect(cancelled.syncStatus).toBe(MeetingSyncStatusEnum.CANCELLED);
      expect(cancelled.zoomLink).toBeNull();
      expect(
        graphCalendarService.cancelOnlineMeetingEvent,
      ).toHaveBeenCalledWith(
        'graph-event-123',
        expect.any(String),
        'organizer@tnzeem.com',
      );

      const dto = RoundSessionResponse.from(cancelled);
      expect(dto.isJoinable).toBe(false);
      expect(dto.zoomLink).toBeNull();
    });
  });

  describe('6. Local persistence failures after external Graph operations', () => {
    it('rolls back (cancels) the created Microsoft Graph event if local persistence fails', async () => {
      const { meetingsService, sessionRepository, graphCalendarService } =
        buildHarness(true);

      // First save (PENDING lock) succeeds; second save (after Graph creation) fails
      let saveCallCount = 0;
      const originalSave = sessionRepository.save;
      sessionRepository.save = jest.fn(async (entity: RoundSessionEntity) => {
        saveCallCount++;
        if (saveCallCount === 2) {
          throw new Error('Database connection lost during commit');
        }
        return originalSave(entity);
      });

      await expect(
        meetingsService.createOrSyncSessionMeeting(101),
      ).rejects.toThrow(InternalServerErrorException);

      expect(
        graphCalendarService.createOnlineMeetingEvent,
      ).toHaveBeenCalledTimes(1);
      expect(
        graphCalendarService.cancelOnlineMeetingEvent,
      ).toHaveBeenCalledWith(
        'graph-event-123',
        expect.stringContaining('rollback'),
        'organizer@tnzeem.com',
      );
    });
  });

  describe('7. MicrosoftGraphAuthService & MicrosoftGraphCalendarService error handling (401, 403, 429)', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
      jest.restoreAllMocks();
    });

    it('acquires and caches OAuth2 client_credentials token, and refreshes after 401 from Graph', async () => {
      const configMap: Record<string, any> = {
        'teams.tenantId': 'tenant-123',
        'teams.clientId': 'client-123',
        'teams.clientSecret': 'secret-xyz',
        'teams.organizerUserId': 'organizer@tnzeem.com',
        'teams.graphBaseUrl': 'https://graph.microsoft.com/v1.0',
        'teams.loginBaseUrl': 'https://login.microsoftonline.com',
        'teams.httpTimeoutMs': 5000,
        'teams.maxRetries': 2,
      };
      const configService = {
        get: jest.fn((k: string) => configMap[k]),
      } as unknown as ConfigService;

      const authService = new MicrosoftGraphAuthService(configService);
      const calendarService = new MicrosoftGraphCalendarService(
        configService,
        authService,
      );

      let tokenCalls = 0;
      let graphCalls = 0;

      global.fetch = jest.fn(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes('/oauth2/v2.0/token')) {
          tokenCalls++;
          return {
            ok: true,
            status: 200,
            json: async () => ({
              token_type: 'Bearer',
              expires_in: 3600,
              access_token: `mock-token-${tokenCalls}`,
            }),
          } as Response;
        }

        graphCalls++;
        if (graphCalls === 1) {
          return {
            ok: false,
            status: 401,
            headers: new Headers(),
            json: async () => ({
              error: { code: 'InvalidAuthenticationToken', message: 'Expired' },
            }),
          } as Response;
        }

        return {
          ok: true,
          status: 201,
          headers: new Headers(),
          text: async () =>
            JSON.stringify({
              id: 'evt-after-refresh',
              onlineMeeting: {
                joinUrl: 'https://teams.microsoft.com/l/meetup-join/ok',
              },
            }),
        } as Response;
      });

      const evt = await calendarService.createOnlineMeetingEvent({
        subject: 'Test',
        start: { dateTime: '2026-11-15T18:00:00', timeZone: 'Asia/Riyadh' },
        end: { dateTime: '2026-11-15T19:00:00', timeZone: 'Asia/Riyadh' },
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
      });

      expect(evt.id).toBe('evt-after-refresh');
      expect(tokenCalls).toBe(2);
      expect(graphCalls).toBe(2);
    });

    it('maps 429 rate limits and 403 insufficient permissions appropriately', async () => {
      const { meetingsService, graphCalendarService } = buildHarness(true);

      graphCalendarService.createOnlineMeetingEvent.mockRejectedValueOnce(
        new MicrosoftGraphApiException(
          'Rate limit exceeded',
          429,
          'TooManyRequests',
          true,
        ),
      );

      await expect(
        meetingsService.createOrSyncSessionMeeting(101),
      ).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.TOO_MANY_REQUESTS,
        }) as unknown as HttpException,
      );

      graphCalendarService.createOnlineMeetingEvent.mockRejectedValueOnce(
        new MicrosoftGraphApiException(
          'Insufficient privileges',
          403,
          'ErrorAccessDenied',
          false,
        ),
      );

      await expect(
        meetingsService.createOrSyncSessionMeeting(101),
      ).rejects.toThrow(BadGatewayException);
    });
  });
});
