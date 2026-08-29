import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { I18nService } from 'nestjs-i18n';
import { EnrollmentEntity } from '../../shared/enrollments/entities/enrollment.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { QueryEnrollmentRequest } from './dto/requests/query-enrollment.request';
import { CreateEnrollmentRequest } from './dto/requests/create-enrollment.request';
import { UpdateEnrollmentRequest } from './dto/requests/update-enrollment.request';
import { EnrollmentResponse } from './dto/responses/enrollment.response';
import { EnrollmentStatusEnum } from '../../shared/enrollments/enums/enrollment-status.enum';
import { getLang } from '../../common/helpers/lang.helper';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';

@Injectable()
export class InstructorEnrollmentsService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
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

  async create(trainerId: number, dto: CreateEnrollmentRequest): Promise<EnrollmentResponse> {
    await this.verifyRoundOwnership(dto.roundId, trainerId);

    const existing = await this.enrollmentRepo.findOne({
      where: { studentId: dto.studentId, roundId: dto.roundId },
    });
    if (existing) {
      throw new ConflictException(
        this.i18n.t('errors.ENROLLMENT_ALREADY_EXISTS', { lang: getLang() }) ||
          'Student is already enrolled in this round',
      );
    }

    const entity = this.enrollmentRepo.create({
      studentId: dto.studentId,
      roundId: dto.roundId,
      status: dto.status ?? EnrollmentStatusEnum.PENDING,
    });

    const saved = await this.enrollmentRepo.save(entity);
    return this.findOne(trainerId, saved.id);
  }

  async findAll(
    trainerId: number,
    query: QueryEnrollmentRequest,
  ): Promise<PaginationResponse<EnrollmentResponse>> {
    const { limit = 10, offset = 0, roundId, studentId, status, search } = query;

    const qb = this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.round', 'round')
      .innerJoinAndSelect('enrollment.student', 'student')
      .innerJoin('round.course', 'course')
      .where('course.trainer_id = :trainerId', { trainerId });

    if (roundId) qb.andWhere('enrollment.round_id = :roundId', { roundId });
    if (studentId) qb.andWhere('enrollment.student_id = :studentId', { studentId });
    if (status) qb.andWhere('enrollment.status = :status', { status });
    if (search) {
      qb.andWhere(
        '(student.first_name ILIKE :search OR student.last_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('enrollment.audit.createdAt', 'DESC');

    const [entities, total] = await qb.skip(offset).take(limit).getManyAndCount();
    const data = entities.map((e) => EnrollmentResponse.fromEntity(e));
    const page = Math.floor(offset / limit) + 1;
    return PaginationResponse.success(data, total, page, limit);
  }

  async findOne(trainerId: number, id: string): Promise<EnrollmentResponse> {
    const entity = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.round', 'round')
      .innerJoinAndSelect('enrollment.student', 'student')
      .innerJoin('round.course', 'course')
      .where('enrollment.id = :id', { id })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) || 'Enrollment not found',
      );
    }
    return EnrollmentResponse.fromEntity(entity);
  }

  async update(trainerId: number, id: string, dto: UpdateEnrollmentRequest): Promise<EnrollmentResponse> {
    const entity = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.round', 'round')
      .innerJoin('round.course', 'course')
      .where('enrollment.id = :id', { id })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) || 'Enrollment not found',
      );
    }

    if (dto.status !== undefined) {
      entity.status = dto.status;
      // Auto-generate certificate serial number when marked as COMPLETED
      if (dto.status === EnrollmentStatusEnum.COMPLETED && !entity.certificateSerialNum) {
        const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
        entity.certificateSerialNum = `CERT-${randomStr}`;
      }
    }

    await this.enrollmentRepo.save(entity);
    return this.findOne(trainerId, id);
  }

  async remove(trainerId: number, id: string): Promise<void> {
    const entity = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.round', 'round')
      .innerJoin('round.course', 'course')
      .where('enrollment.id = :id', { id })
      .andWhere('course.trainer_id = :trainerId', { trainerId })
      .getOne();

    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) || 'Enrollment not found',
      );
    }

    await this.enrollmentRepo.remove(entity);
  }
}
