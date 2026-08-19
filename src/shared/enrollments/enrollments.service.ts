import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { I18nService } from 'nestjs-i18n';
import { EnrollmentsRepository } from './repositories/enrollments.repository';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserTypeEnum } from '../user/enums/user-type.enum';
import { CreateEnrollmentRequest } from './dto/requests/create-enrollment.request';
import { UpdateEnrollmentRequest } from './dto/requests/update-enrollment.request';
import { QueryEnrollmentRequest } from './dto/requests/query-enrollment.request';
import { EnrollmentStatusEnum } from './enums/enrollment-status.enum';
import { getLang } from '../../common/helpers/lang.helper';
import { CertificateResponse } from './dto/responses/certificate.response';

@Injectable()
export class EnrollmentsService {
    constructor(
        private readonly enrollmentsRepository: EnrollmentsRepository,
        @InjectRepository(RoundEntity)
        private readonly roundRepo: Repository<RoundEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly i18n: I18nService,
    ) {}

    // Helpers

    private async ensureStudentExists(studentId: number): Promise<UserEntity> {
        const student = await this.userRepo.findOne({
            where: { id: studentId, userType: UserTypeEnum.STUDENT },
        });
        if (!student) {
            throw new NotFoundException(
                this.i18n.t('errors.USER_NOT_FOUND', { lang: getLang() }),
            );
        }
        return student;
    }

    private async ensureRoundExists(roundId: number): Promise<RoundEntity> {
        const round = await this.roundRepo.findOne({ where: { id: roundId } });
        if (!round) {
            throw new NotFoundException(
                this.i18n.t('errors.ROUND_NOT_FOUND', { lang: getLang() }),
            );
        }
        return round;
    }

    // List / Paginate

    async findAll(query: QueryEnrollmentRequest): Promise<{ data: EnrollmentEntity[]; total: number }> {
        const { page = 1, limit = 10, studentId, roundId, status } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (studentId) where.studentId = studentId;
        if (roundId)   where.roundId   = roundId;
        if (status)    where.status     = status;

        const [data, total] = await this.enrollmentsRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: { audit: { createdAt: 'DESC' } },
            relations: { student: true, round: true },
        });

        return { data, total };
    }

    // Find One

    async findOne(id: string): Promise<EnrollmentEntity> {
        const enrollment = await this.enrollmentsRepository.findOne({
            where: { id },
            relations: { student: true, round: true, order: true },
        });

        if (!enrollment) {
            throw new NotFoundException(
                this.i18n.t('errors.ENROLLMENT_NOT_FOUND', { lang: getLang() }),
            );
        }

        return enrollment;
    }

    // Create

    async create(dto: CreateEnrollmentRequest): Promise<EnrollmentEntity> {
        await this.ensureStudentExists(dto.studentId);

        if (dto.roundId != null) {
            await this.ensureRoundExists(dto.roundId);

            const alreadyEnrolled = await this.enrollmentsRepository.exists(dto.studentId, dto.roundId);
            if (alreadyEnrolled) {
                throw new ConflictException(
                    this.i18n.t('errors.ENROLLMENT_ALREADY_EXISTS', { lang: getLang() }),
                );
            }
        }

        const enrollment = this.enrollmentsRepository.create({
            studentId: dto.studentId,
            roundId:   dto.roundId,
            orderId:   dto.orderId,
            status:    dto.status ?? EnrollmentStatusEnum.PENDING,
        });

        const saved = await this.enrollmentsRepository.save(enrollment);
        return this.findOne(saved.id);
    }

    // Update

    async update(id: string, dto: UpdateEnrollmentRequest): Promise<EnrollmentEntity> {
        const enrollment = await this.findOne(id);

        if (dto.status !== undefined) {
            enrollment.status = dto.status;

            // Auto-generate certificate serial number if marked completed and doesn't have one
            if (dto.status === EnrollmentStatusEnum.COMPLETED && !enrollment.certificateSerialNum) {
                const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
                enrollment.certificateSerialNum = `CERT-${randomStr}`;
            }
        }

        await this.enrollmentsRepository.save(enrollment);
        return this.findOne(id);
    }

    // Delete

    async remove(id: string): Promise<void> {
        const enrollment = await this.findOne(id);
        await this.enrollmentsRepository.remove(enrollment);
    }

    // Verify Certificate
    async verifyCertificate(certificateSerialNum: string): Promise<CertificateResponse> {
        const enrollment = await this.enrollmentsRepository.findOne({
            where: { certificateSerialNum },
            relations: { student: true, round: { course: { trainer: true } } },
        });

        if (!enrollment) {
            throw new NotFoundException(
                this.i18n.t('errors.CERTIFICATE_NOT_FOUND', { lang: getLang() }),
            );
        }

        if (enrollment.status !== EnrollmentStatusEnum.COMPLETED) {
            throw new ConflictException(
                this.i18n.t('errors.CERTIFICATE_NOT_COMPLETE_YET', { lang: getLang() }),
            );
        }

        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const lang = getLang();

        return CertificateResponse.fromEntity(enrollment, appUrl, lang);
    }
}
