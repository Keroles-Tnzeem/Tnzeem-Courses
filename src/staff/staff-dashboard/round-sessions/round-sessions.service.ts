import { assertSessionWithinRound } from '../../../common/helpers/round-dates.helper';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
    Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RoundSessionEntity } from './entities/round-session.entity';
import { RoundEntity } from '../rounds/entities/round.entity';
import { CreateRoundSessionRequest } from './dto/requests/create-round-session.request';
import { UpdateRoundSessionRequest } from './dto/requests/update-round-session.request';
import { QueryRoundSessionRequest } from './dto/requests/query-round-session.request';
import { getLang } from '../../../common/helpers/lang.helper';
import { MeetingsService } from '../../../shared/meetings/meetings.service';
import { MeetingStatusEnum } from '../../../shared/meetings/enums/meeting-status.enum';

@Injectable()
export class RoundSessionsService {
    constructor(
        @InjectRepository(RoundSessionEntity)
        private readonly sessionRepository: Repository<RoundSessionEntity>,

        @InjectRepository(RoundEntity)
        private readonly roundRepository: Repository<RoundEntity>,

        private readonly i18n: I18nService,

        @Optional()
        private readonly meetingsService?: MeetingsService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    async create(dto: CreateRoundSessionRequest): Promise<RoundSessionEntity> {
        const round = await this.roundRepository.findOne({
            where: { id: dto.roundId },
        });
        if (!round) {
            throw new NotFoundException(
                this.i18n.t('errors.ROUND_NOT_FOUND', { lang: getLang() }),
            );
        }

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

        const duplicate = await this.sessionRepository.findOne({
            where: { roundId: dto.roundId, sessionNumber: dto.sessionNumber },
        });
        if (duplicate) {
            throw new BadRequestException(
                this.i18n.t('errors.SESSION_NUMBER_TAKEN', { lang: getLang() }),
            );
        }

        const entity = this.sessionRepository.create({
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

        const saved = await this.sessionRepository.save(entity);

        if (
            this.meetingsService &&
            this.meetingsService.shouldProvisionTeamsMeeting({
                scheduledAt,
                zoomLink: dto.zoomLink,
                createTeamsMeeting: dto.createTeamsMeeting,
            })
        ) {
            return await this.meetingsService.createOrSyncSessionMeeting(
                saved.id,
                {
                    title: dto.title,
                    notes: dto.notes,
                    startTime: scheduledAt,
                    endTime: scheduledEnd,
                    durationMinutes,
                    timezone,
                    inviteAttendees: dto.inviteAttendees ?? true,
                },
            );
        }

        return saved;
    }

    async findAll(
        query: QueryRoundSessionRequest,
    ): Promise<{ data: RoundSessionEntity[]; total: number }> {
        const {
            page = 1,
            limit = 10,
            roundId,
            courseId,
            meetingStatus,
            syncStatus,
            upcomingOnly,
            sortBy = 'session_number',
            sortOrder = 'ASC',
        } = query;

        const skip = (page - 1) * limit;

        const qb = this.sessionRepository
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.round', 'round');

        if (roundId) {
            qb.andWhere('session.round_id = :roundId', { roundId });
        }
        if (courseId) {
            qb.andWhere('round.course_id = :courseId', { courseId });
        }
        if (meetingStatus) {
            qb.andWhere('session.meeting_status = :meetingStatus', {
                meetingStatus,
            });
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

        const orderField = sortMap[sortBy] ?? 'session.sessionNumber';
        qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }

    async findOne(id: number): Promise<RoundSessionEntity> {
        const entity = await this.sessionRepository.findOne({
            where: { id },
            relations: { round: true },
        });
        if (!entity) {
            throw new NotFoundException(
                this.i18n.t('errors.NOT_FOUND', { lang: getLang() }),
            );
        }
        return entity;
    }

    /** Loads the session without its round so saving never rewrites round_id from the relation. */
    private async findForWrite(id: number): Promise<RoundSessionEntity> {
        const entity = await this.sessionRepository.findOne({ where: { id } });
        if (!entity) {
            throw new NotFoundException(
                this.i18n.t('errors.NOT_FOUND', { lang: getLang() }),
            );
        }
        return entity;
    }

    async findByRound(roundId: number): Promise<RoundSessionEntity[]> {
        const round = await this.roundRepository.findOne({ where: { id: roundId } });
        if (!round) {
            throw new NotFoundException(
                this.i18n.t('errors.ROUND_NOT_FOUND', { lang: getLang() }),
            );
        }

        return await this.sessionRepository.find({
            where: { roundId },
            order: { sessionNumber: 'ASC' },
        });
    }

    async update(
        id: number,
        dto: UpdateRoundSessionRequest,
    ): Promise<RoundSessionEntity> {
        const entity = await this.findForWrite(id);

        if (dto.sessionNumber && dto.sessionNumber !== entity.sessionNumber) {
            const duplicate = await this.sessionRepository.findOne({
                where: { roundId: entity.roundId, sessionNumber: dto.sessionNumber },
            });
            if (duplicate) {
                throw new BadRequestException(
                    this.i18n.t('errors.SESSION_NUMBER_TAKEN', { lang: getLang() }),
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
                const round = await this.roundRepository.findOne({
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
                        const round = await this.roundRepository.findOne({
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

        const saved = await this.sessionRepository.save(entity);

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

    async resyncMeeting(id: number): Promise<RoundSessionEntity> {
        const entity = await this.findForWrite(id);
        if (!this.meetingsService) {
            return entity;
        }
        return await this.meetingsService.resyncSessionMeeting(entity.id);
    }

    async cancelMeeting(id: number): Promise<RoundSessionEntity> {
        const entity = await this.findForWrite(id);
        if (!this.meetingsService) {
            entity.meetingStatus = MeetingStatusEnum.CANCELLED;
            entity.zoomLink = null as unknown as string;
            return await this.sessionRepository.save(entity);
        }
        return await this.meetingsService.cancelSessionMeeting(entity.id);
    }

    async remove(id: number): Promise<void> {
        const entity = await this.findForWrite(id);
        if (this.meetingsService && entity.microsoftEventId) {
            await this.meetingsService.cancelSessionMeeting(entity.id);
        }
        await this.sessionRepository.softDelete(entity.id);
    }
}
