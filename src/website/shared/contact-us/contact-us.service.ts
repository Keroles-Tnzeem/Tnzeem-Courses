import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { InquiryEntity } from '../../../shared/inquiries/entities/inquiry.entity';
import { CourseEntity } from '../../../staff/staff-dashboard/courses/entities/course.entity';
import { CourseStatusEnum } from '../../../staff/staff-dashboard/courses/enums/course-status.enum';
import { UserTypeEnum } from '../../../shared/user/enums/user-type.enum';
import { UserEntity } from '../../../shared/user/entities/user.entity';
import { CreateInquiryRequest } from './dto/requests/create-inquiry.request';
import { InquiryResponse } from './dto/responses/inquiry.response';
import { getLang } from '../../../common/helpers/lang.helper';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepo: Repository<InquiryEntity>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    private readonly i18n: I18nService,
  ) {}

  /**
   * Create a new inquiry.
   * – Validates the course exists and is published.
   * – Optionally links to a student whose phone already matches.
   */
  async create(dto: CreateInquiryRequest): Promise<InquiryResponse> {
    const lang = getLang();

    // Ensure the course exists and is published.
    const course = await this.courseRepo.findOne({
      where: { id: dto.courseId, status: CourseStatusEnum.PUBLISHED },
    });
    if (!course) {
      throw new NotFoundException(
        this.i18n.t('errors.COURSE_NOT_FOUND', { lang }),
      );
    }

    // Try to find a matching student by phone so we can pre-link the inquiry.
    const matchingStudent = await this.userRepo.findOne({
      where: { phone: dto.phone, userType: UserTypeEnum.STUDENT },
    });

    const inquiry = this.inquiryRepo.create({
      phone: dto.phone,
      courseId: dto.courseId,
      notes: dto.notes ?? null,
      studentId: matchingStudent?.id ?? null,
    });

    const saved = await this.inquiryRepo.save(inquiry);
    return InquiryResponse.from(saved);
  }

  /**
   * Called after a student successfully changes their phone number.
   * Finds all existing inquiries that match the new number and links them
   * to the student.
   */
  async linkInquiriesToStudent(phone: string, studentId: number): Promise<void> {
    await this.inquiryRepo
      .createQueryBuilder()
      .update(InquiryEntity)
      .set({ studentId })
      .where('phone = :phone', { phone })
      .andWhere('student_id IS NULL')
      .execute();
  }
}
