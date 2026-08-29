import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { CourseEntity } from '../../staff-dashboard/courses/entities/course.entity';
import { CreateRoundRequest } from './dto/requests/create-round.request';
import { UpdateRoundRequest } from './dto/requests/update-round.request';
import { QueryRoundRequest } from './dto/requests/query-round.request';
import { RoundResponse } from './dto/responses/round.response';
import { getLang } from '../../common/helpers/lang.helper';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';

@Injectable()
export class InstructorRoundsService {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepo: Repository<RoundEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    private readonly i18n: I18nService,
  ) {}

  private async verifyCourseOwnership(
    courseId: number,
    trainerId: number,
  ): Promise<CourseEntity> {
    const course = await this.courseRepo.findOne({
      where: { id: courseId, trainerId },
    });
    if (!course) {
      throw new NotFoundException(
        this.i18n.t('errors.COURSE_NOT_FOUND', { lang: getLang() }) ||
          'Course not found or access denied',
      );
    }
    return course;
  }

  async create(
    trainerId: number,
    dto: CreateRoundRequest,
  ): Promise<RoundResponse> {
    await this.verifyCourseOwnership(dto.courseId, trainerId);

    const duplicate = await this.roundRepo.findOne({
      where: { courseId: dto.courseId, roundNumber: dto.roundNumber },
    });
    if (duplicate) {
      throw new BadRequestException(
        this.i18n.t('errors.ROUND_NUMBER_TAKEN', { lang: getLang() }) ||
          'Round number already exists for this course',
      );
    }

    const entity = this.roundRepo.create({
      courseId: dto.courseId,
      roundNumber: dto.roundNumber,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status,
      showRound: dto.showRound,
      notes: dto.notes,
    });

    const savedRound = await this.roundRepo.save(entity);
    return RoundResponse.fromEntity(savedRound, getLang());
  }

  async findAll(
    trainerId: number,
    query: QueryRoundRequest,
  ): Promise<PaginationResponse<RoundResponse>> {
    const { limit = 10, offset = 0, courseId, status } = query;

    const qb = this.roundRepo
      .createQueryBuilder('round')
      .innerJoinAndSelect('round.course', 'course')
      .leftJoinAndSelect('round.sessions', 'sessions')
      .where('course.trainer_id = :trainerId', { trainerId });

    if (courseId) {
      qb.andWhere('round.course_id = :courseId', { courseId });
    }

    if (status) {
      qb.andWhere('round.status = :status', { status });
    }

    qb.orderBy('round.audit.createdAt', 'DESC');

    const [entities, total] = await qb
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((entity) =>
      RoundResponse.fromEntity(entity, getLang()),
    );

    const page = Math.floor(offset / limit) + 1;
    return PaginationResponse.success(data, total, page, limit);
  }

  async findOne(trainerId: number, id: number): Promise<RoundResponse> {
    const entity = await this.roundRepo
      .createQueryBuilder('round')
      .innerJoinAndSelect('round.course', 'course')
      .leftJoinAndSelect('round.sessions', 'sessions')
      .where('round.id = :id', { id })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) ||
          'Round not found',
      );
    }
    return RoundResponse.fromEntity(entity, getLang());
  }

  async findByCourse(trainerId: number, courseId: number): Promise<RoundResponse[]> {
    await this.verifyCourseOwnership(courseId, trainerId);

    const entities = await this.roundRepo
      .createQueryBuilder('round')
      .innerJoinAndSelect('round.course', 'course')
      .leftJoinAndSelect('round.sessions', 'sessions')
      .where('round.course_id = :courseId', { courseId })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .orderBy('round.roundNumber', 'ASC')
      .getMany();

    return entities.map((entity) => RoundResponse.fromEntity(entity, getLang()));
  }

  async update(
    trainerId: number,
    id: number,
    dto: UpdateRoundRequest,
  ): Promise<RoundResponse> {
    const entity = await this.roundRepo
      .createQueryBuilder('round')
      .innerJoinAndSelect('round.course', 'course')
      .where('round.id = :id', { id })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) ||
          'Round not found',
      );
    }

    if (dto.courseId && dto.courseId !== entity.courseId) {
      await this.verifyCourseOwnership(dto.courseId, trainerId);
      entity.courseId = dto.courseId;
    }

    if (dto.roundNumber && dto.roundNumber !== entity.roundNumber) {
      const duplicate = await this.roundRepo.findOne({
        where: { courseId: entity.courseId, roundNumber: dto.roundNumber },
      });
      if (duplicate) {
        throw new BadRequestException(
          this.i18n.t('errors.ROUND_NUMBER_TAKEN', { lang: getLang() }) ||
            'Round number already exists for this course',
        );
      }
      entity.roundNumber = dto.roundNumber;
    }

    if (dto.startDate !== undefined) {
      entity.startDate = dto.startDate ? new Date(dto.startDate) : null as unknown as Date;
    }
    if (dto.endDate !== undefined) {
      entity.endDate = dto.endDate ? new Date(dto.endDate) : null as unknown as Date;
    }
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.showRound !== undefined) entity.showRound = dto.showRound;
    if (dto.notes !== undefined) entity.notes = dto.notes;

    const savedRound = await this.roundRepo.save(entity);
    return RoundResponse.fromEntity(savedRound, getLang());
  }

  async remove(trainerId: number, id: number): Promise<void> {
    const entity = await this.roundRepo
      .createQueryBuilder('round')
      .innerJoinAndSelect('round.course', 'course')
      .where('round.id = :id', { id })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) ||
          'Round not found',
      );
    }

    await this.roundRepo.softDelete(entity.id);
  }
}
