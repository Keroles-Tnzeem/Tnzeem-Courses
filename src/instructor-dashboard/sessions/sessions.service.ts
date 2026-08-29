import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { RoundSessionEntity } from '../../staff-dashboard/round-sessions/entities/round-session.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { CreateSessionRequest } from './dto/requests/create-session.request';
import { UpdateSessionRequest } from './dto/requests/update-session.request';
import { QuerySessionRequest } from './dto/requests/query-session.request';
import { SessionResponse } from './dto/responses/session.response';
import { getLang } from '../../common/helpers/lang.helper';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';

@Injectable()
export class InstructorSessionsService {
  constructor(
    @InjectRepository(RoundSessionEntity)
    private readonly sessionRepo: Repository<RoundSessionEntity>,
    @InjectRepository(RoundEntity)
    private readonly roundRepo: Repository<RoundEntity>,
    private readonly i18n: I18nService,
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

  async create(trainerId: number, dto: CreateSessionRequest): Promise<SessionResponse> {
    await this.verifyRoundOwnership(dto.roundId, trainerId);

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
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      zoomLink: dto.zoomLink,
      durationMinutes: dto.durationMinutes,
      notes: dto.notes,
    });

    const saved = await this.sessionRepo.save(entity);
    return SessionResponse.fromEntity(saved);
  }

  async findAll(
    trainerId: number,
    query: QuerySessionRequest,
  ): Promise<PaginationResponse<SessionResponse>> {
    const { limit = 10, offset = 0, roundId, sortBy = 'session_number', sortOrder = 'ASC' } = query;

    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .innerJoin('session.round', 'round')
      .innerJoin('round.course', 'course')
      .where('course.trainer_id = :trainerId', { trainerId });

    if (roundId) {
      qb.andWhere('session.round_id = :roundId', { roundId });
    }

    const sortMap: Record<string, string> = {
      session_number: 'session.sessionNumber',
      scheduled_at: 'session.scheduledAt',
      created_at: 'session.audit.createdAt',
    };

    qb.orderBy(sortMap[sortBy] ?? 'session.sessionNumber', sortOrder as 'ASC' | 'DESC');

    const [entities, total] = await qb.skip(offset).take(limit).getManyAndCount();
    const data = entities.map((e) => SessionResponse.fromEntity(e));
    const page = Math.floor(offset / limit) + 1;
    return PaginationResponse.success(data, total, page, limit);
  }

  async findOne(trainerId: number, id: number): Promise<SessionResponse> {
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
    return SessionResponse.fromEntity(entity);
  }

  async update(trainerId: number, id: number, dto: UpdateSessionRequest): Promise<SessionResponse> {
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

    if (dto.scheduledAt !== undefined) {
      entity.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null as unknown as Date;
    }
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.zoomLink !== undefined) entity.zoomLink = dto.zoomLink;
    if (dto.durationMinutes !== undefined) entity.durationMinutes = dto.durationMinutes;
    if (dto.notes !== undefined) entity.notes = dto.notes;

    const saved = await this.sessionRepo.save(entity);
    return SessionResponse.fromEntity(saved);
  }

  async remove(trainerId: number, id: number): Promise<void> {
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

    await this.sessionRepo.softDelete(entity.id);
  }
}
