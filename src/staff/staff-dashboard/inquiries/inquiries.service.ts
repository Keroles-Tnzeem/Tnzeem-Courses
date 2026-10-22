import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { InquiryEntity } from '../../../shared/inquiries/entities/inquiry.entity';
import { QueryInquiryRequest } from './dto/requests/query-inquiry.request';
import { UpdateInquiryStatusRequest } from './dto/requests/update-inquiry-status.request';
import { StaffInquiryResponse } from './dto/responses/staff-inquiry.response';
import { PaginationResponseDto } from '../../../common/dto/responses/pagination.response';
import { getLang } from '../../../common/helpers/lang.helper';

@Injectable()
export class StaffInquiriesService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepo: Repository<InquiryEntity>,

    private readonly i18n: I18nService,
  ) {}

  async findAll(
    query: QueryInquiryRequest,
  ): Promise<PaginationResponseDto<StaffInquiryResponse>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 15;
    const skip = (page - 1) * limit;

    const qb = this.inquiryRepo
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.student', 'student')
      .leftJoinAndSelect('inquiry.course', 'course')
      .orderBy('inquiry.audit.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.phone) {
      qb.andWhere('inquiry.phone ILIKE :phone', {
        phone: `%${query.phone}%`,
      });
    }

    if (query.courseId) {
      qb.andWhere('inquiry.course_id = :courseId', { courseId: query.courseId });
    }

    if (query.studentId) {
      qb.andWhere('inquiry.student_id = :studentId', { studentId: query.studentId });
    }

    if (query.status) {
      qb.andWhere('inquiry.status = :status', { status: query.status });
    }

    if (query.startDate) {
      qb.andWhere('inquiry.created_at >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('inquiry.created_at <= :endDate', {
        endDate: query.endDate + ' 23:59:59',
      });
    }

    const [rows, total] = await qb.getManyAndCount();
    const lang = getLang();
    const data = rows.map((row) => StaffInquiryResponse.from(row, lang));

    return PaginationResponseDto.success(data, total, page, limit);
  }

  async findOne(id: number): Promise<StaffInquiryResponse> {
    const lang = getLang();
    const inquiry = await this.inquiryRepo.findOne({
      where: { id },
      relations: ['student', 'course'],
    });

    if (!inquiry) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang }),
      );
    }

    return StaffInquiryResponse.from(inquiry);
  }

  async updateStatus(
    id: number,
    dto: UpdateInquiryStatusRequest,
  ): Promise<StaffInquiryResponse> {
    const lang = getLang();
    const inquiry = await this.inquiryRepo.findOne({
      where: { id },
      relations: ['student', 'course'],
    });

    if (!inquiry) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang }),
      );
    }

    inquiry.status = dto.status;
    const saved = await this.inquiryRepo.save(inquiry);
    return StaffInquiryResponse.from(saved);
  }
}
