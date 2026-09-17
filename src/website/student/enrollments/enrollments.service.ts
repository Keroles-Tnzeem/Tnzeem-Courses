import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { EnrollmentsRepository } from '../../../shared/enrollments/repositories/enrollments.repository';
import { PaginationResponseDto as PaginationResponse } from '../../../common/dto/responses/pagination.response';
import { QueryStudentEnrollmentRequest } from './dto/requests/query-student-enrollment.request';
import { StudentEnrollmentResponse } from './dto/responses/student-enrollment.response';
import { StudentEnrollmentDetailsResponse } from './dto/responses/student-enrollment-details.response';

@Injectable()
export class StudentEnrollmentsService {
  constructor(
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly i18n: I18nService,
  ) {}

  async findAll(
    studentId: number,
    query: QueryStudentEnrollmentRequest,
    lang: string,
  ): Promise<PaginationResponse<StudentEnrollmentResponse>> {
    const { page = 1, limit = 10, status, sortOrder = 'DESC' } = query;

    const [entities, total] = await this.enrollmentsRepository.findAndCount({
      where: { studentId, ...(status && { status }) },
      relations: { round: { course: true } },
      order: { audit: { createdAt: sortOrder } },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = entities.map((e) =>
      StudentEnrollmentResponse.fromEntity(e, lang),
    );
    return PaginationResponse.success(data, total, page, limit);
  }

  async findOne(
    studentId: number,
    id: string,
    lang: string,
  ): Promise<StudentEnrollmentDetailsResponse> {
    const enrollment = await this.enrollmentsRepository.findOne({
      where: { id, studentId },
      relations: { round: { course: true, sessions: true } },
    });

    if (!enrollment) {
      throw new NotFoundException(
        this.i18n.t('errors.ENROLLMENT_NOT_FOUND', { lang }),
      );
    }

    return StudentEnrollmentDetailsResponse.fromEntity(enrollment, lang);
  }
}
