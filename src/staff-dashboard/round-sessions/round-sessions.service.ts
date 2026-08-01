import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RoundSessionEntity } from './entities/round-session.entity';
import { RoundEntity } from '../rounds/entities/round.entity';
import { CreateRoundSessionRequest } from './dto/requests/create-round-session.request';
import { UpdateRoundSessionRequest } from './dto/requests/update-round-session.request';
import { QueryRoundSessionRequest } from './dto/requests/query-round-session.request';

@Injectable()
export class RoundSessionsService {
    constructor(
        @InjectRepository(RoundSessionEntity)
        private readonly sessionRepository: Repository<RoundSessionEntity>,

        @InjectRepository(RoundEntity)
        private readonly roundRepository: Repository<RoundEntity>,

        private readonly i18n: I18nService,
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
                this.i18n.t('errors.ROUND_NOT_FOUND', { lang: this.lang() }),
            );
        }

        const duplicate = await this.sessionRepository.findOne({
            where: { roundId: dto.roundId, sessionNumber: dto.sessionNumber },
        });
        if (duplicate) {
            throw new BadRequestException(
                this.i18n.t('errors.SESSION_NUMBER_TAKEN', { lang: this.lang() }),
            );
        }

        const entity = this.sessionRepository.create({
            roundId: dto.roundId,
            sessionNumber: dto.sessionNumber,
            title: dto.title,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
            zoomLink: dto.zoomLink,
            durationMinutes: dto.durationMinutes,
            notes: dto.notes,
        });

        return await this.sessionRepository.save(entity);
    }

    async findAll(
        query: QueryRoundSessionRequest,
    ): Promise<{ data: RoundSessionEntity[]; total: number }> {
        const {
            page = 1,
            limit = 10,
            roundId,
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
                this.i18n.t('errors.NOT_FOUND', { lang: this.lang() }),
            );
        }
        return entity;
    }

    async findByRound(roundId: number): Promise<RoundSessionEntity[]> {
        const round = await this.roundRepository.findOne({ where: { id: roundId } });
        if (!round) {
            throw new NotFoundException(
                this.i18n.t('errors.ROUND_NOT_FOUND', { lang: this.lang() }),
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
        const entity = await this.findOne(id);

        if (dto.sessionNumber && dto.sessionNumber !== entity.sessionNumber) {
            const duplicate = await this.sessionRepository.findOne({
                where: { roundId: entity.roundId, sessionNumber: dto.sessionNumber },
            });
            if (duplicate) {
                throw new BadRequestException(
                    this.i18n.t('errors.SESSION_NUMBER_TAKEN', { lang: this.lang() }),
                );
            }
        }

        if (dto.scheduledAt !== undefined) {
            entity.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null as unknown as Date;
        }
        if (dto.sessionNumber !== undefined) entity.sessionNumber = dto.sessionNumber;
        if (dto.title !== undefined) entity.title = dto.title;
        if (dto.zoomLink !== undefined) entity.zoomLink = dto.zoomLink;
        if (dto.durationMinutes !== undefined) entity.durationMinutes = dto.durationMinutes;
        if (dto.notes !== undefined) entity.notes = dto.notes;

        return await this.sessionRepository.save(entity);
    }

    async remove(id: number): Promise<void> {
        const entity = await this.findOne(id);
        await this.sessionRepository.softDelete(entity.id);
    }
}
