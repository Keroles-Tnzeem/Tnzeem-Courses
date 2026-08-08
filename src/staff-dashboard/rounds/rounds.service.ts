import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RoundEntity } from './entities/round.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { CreateRoundRequest } from './dto/requests/create-round.request';
import { UpdateRoundRequest } from './dto/requests/update-round.request';
import { QueryRoundRequest } from './dto/requests/query-round.request';
import {getLang} from "../../common/helpers/lang.helper";

@Injectable()
export class RoundsService {
    constructor(
        @InjectRepository(RoundEntity)
        private readonly roundRepository: Repository<RoundEntity>,

        @InjectRepository(CourseEntity)
        private readonly courseRepository: Repository<CourseEntity>,

        private readonly i18n: I18nService,
    ) {}



    async create(dto: CreateRoundRequest): Promise<RoundEntity> {
        const course = await this.courseRepository.findOne({
            where: { id: dto.courseId },
        });
        if (!course) {
            throw new NotFoundException(
                this.i18n.t('errors.COURSE_NOT_FOUND', { lang: getLang() }),
            );
        }

        const duplicate = await this.roundRepository.findOne({
            where: { courseId: dto.courseId, roundNumber: dto.roundNumber },
        });
        if (duplicate) {
            throw new BadRequestException(
                this.i18n.t('errors.ROUND_NUMBER_TAKEN', { lang: getLang() }),
            );
        }

        const entity = this.roundRepository.create({
            courseId: dto.courseId,
            roundNumber: dto.roundNumber,
            startDate: dto.startDate ? new Date(dto.startDate) : undefined,
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            status: dto.status,
            notes: dto.notes,
        });

        return await this.roundRepository.save(entity);
    }

    async findAll(
        query: QueryRoundRequest,
    ): Promise<{ data: RoundEntity[]; total: number }> {
        const {
            page = 1,
            limit = 10,
            courseId,
            status,
            sortBy = 'round_number',
            sortOrder = 'ASC',
        } = query;

        const skip = (page - 1) * limit;

        const qb = this.roundRepository
            .createQueryBuilder('round')
            .leftJoinAndSelect('round.course', 'course')
            .leftJoinAndSelect('round.sessions', 'sessions');

        if (courseId) {
            qb.andWhere('round.course_id = :courseId', { courseId });
        }

        if (status) {
            qb.andWhere('round.status = :status', { status });
        }

        const sortMap: Record<string, string> = {
            round_number: 'round.roundNumber',
            start_date: 'round.startDate',
            created_at: 'round.audit.createdAt',
        };

        const orderField = sortMap[sortBy] ?? 'round.roundNumber';
        qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }

    async findOne(id: number): Promise<RoundEntity> {
        const entity = await this.roundRepository.findOne({
            where: { id },
            relations: { course: true, sessions: true },
        });
        if (!entity) {
            throw new NotFoundException(
                this.i18n.t('errors.NOT_FOUND', { lang: getLang() }),
            );
        }
        return entity;
    }

    async findByCourse(courseId: number): Promise<RoundEntity[]> {
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
        });
        if (!course) {
            throw new NotFoundException(
                this.i18n.t('errors.COURSE_NOT_FOUND', { lang: getLang() }),
            );
        }

        return await this.roundRepository.find({
            where: { courseId },
            relations: { sessions: true },
            order: { roundNumber: 'ASC' },
        });
    }

    async update(id: number, dto: UpdateRoundRequest): Promise<RoundEntity> {
        const entity = await this.findOne(id);

        if (dto.roundNumber && dto.roundNumber !== entity.roundNumber) {
            const duplicate = await this.roundRepository.findOne({
                where: { courseId: entity.courseId, roundNumber: dto.roundNumber },
            });
            if (duplicate) {
                throw new BadRequestException(
                    this.i18n.t('errors.ROUND_NUMBER_TAKEN', { lang: getLang() }),
                );
            }
        }

        if (dto.startDate !== undefined) {
            entity.startDate = dto.startDate ? new Date(dto.startDate) : null as unknown as Date;
        }
        if (dto.endDate !== undefined) {
            entity.endDate = dto.endDate ? new Date(dto.endDate) : null as unknown as Date;
        }
        if (dto.roundNumber !== undefined) entity.roundNumber = dto.roundNumber;
        if (dto.status !== undefined) entity.status = dto.status;
        if (dto.notes !== undefined) entity.notes = dto.notes;

        return await this.roundRepository.save(entity);
    }

    async remove(id: number): Promise<void> {
        const entity = await this.findOne(id);
        await this.roundRepository.softDelete(entity.id);
    }
}
