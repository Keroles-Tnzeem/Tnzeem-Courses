import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { InquiryEntity } from '../../../shared/inquiries/entities/inquiry.entity';
import { CourseEntity } from '../../../staff/staff-dashboard/courses/entities/course.entity';
import { CourseStatusEnum } from '../../../staff/staff-dashboard/courses/enums/course-status.enum';
import { UserTypeEnum } from '../../../shared/user/enums/user-type.enum';
import { UserEntity } from '../../../shared/user/entities/user.entity';
import { OrderEntity } from '../../../shared/orders/entities/order.entity';
import { OrderStatusEnum } from '../../../shared/orders/enums/order-status.enum';
import { OrderCreatorTypeEnum } from '../../../shared/orders/enums/order-creator-type.enum';
import { PaymentMethodEnum } from '../../../shared/payment/enums/payment-method.enum';
import { PaymentStatusEnum } from '../../../shared/payment/enums/payment-status.enum';
import { SourcesService } from '../../../staff/staff-dashboard/sources/sources.service';
import { CreateInquiryRequest } from './dto/requests/create-inquiry.request';
import { InquiryResponse } from './dto/responses/inquiry.response';
import { MakeOrderRequest } from './dto/requests/make-order.request';
import { MakeOrderResponse } from './dto/responses/make-order.response';
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

    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,

    private readonly sourcesService: SourcesService,

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
   * Creates an order for a course using a phone number.
   * If a student with this phone exists, their data is retrieved and used.
   * If not, a new student account is created, unassigned inquiries are linked,
   * and the order is placed.
   */
  async makeOrder(dto: MakeOrderRequest): Promise<MakeOrderResponse> {
    const lang = getLang();

    // 1. Ensure the course exists and is published.
    const course = await this.courseRepo.findOne({
      where: { id: dto.courseId, status: CourseStatusEnum.PUBLISHED },
    });
    if (!course) {
      throw new NotFoundException(
        this.i18n.t('errors.COURSE_NOT_FOUND', { lang }),
      );
    }

    // 2. Look up user by phone.
    let student = await this.userRepo.findOne({
      where: { phone: dto.phone },
    });
    let isNewStudent = false;

    if (student) {
      // If the user exists with this phone, ensure they are a student.
      if (student.userType !== UserTypeEnum.STUDENT) {
        throw new ConflictException(
          this.i18n.t('errors.PHONE_TAKEN', { lang }),
        );
      }
    } else {
      // 3. If student does not exist, create new student.
      isNewStudent = true;

      const sourceId = await this.resolveSourceId(dto.source);

      const randomPassword = randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newStudent = this.userRepo.create({
        firstName: '',
        lastName: '',
        email: '',
        phone: dto.phone,
        gender: null as any,
        password: hashedPassword,
        userType: UserTypeEnum.STUDENT,
        sourceId,
      });

      student = await this.userRepo.save(newStudent);

      // Link any previously unassigned inquiries with this phone number.
      await this.linkInquiriesToStudent(dto.phone, student.id);
    }

    // 4. Create the order for the student.
    const coursePrice = Number(course.price);

    const order = this.orderRepo.create({
      studentId: student.id,
      roundId: null,
      courseId: course.id,
      trainerId: course.trainerId,
      mainPrice: coursePrice,
      priceAfterDiscount: coursePrice,
      finalPrice: coursePrice,
      hasEnrollment: false,
      status: OrderStatusEnum.PENDING,
      paymentMethod: PaymentMethodEnum.CASH,
      paymentStatus: PaymentStatusEnum.PENDING,
      createdBy: OrderCreatorTypeEnum.STUDENT,
      createdById: student.id,
    });

    const saved = await this.orderRepo.save(order);

    // 5. Fetch order with course and student relations for the response.
    const orderWithRelations = await this.orderRepo.findOne({
      where: { id: saved.id },
      relations: {
        student: true,
        course: true,
      },
    });

    return MakeOrderResponse.from(orderWithRelations ?? saved, isNewStudent, lang);
  }

  private async resolveSourceId(
    source: string | undefined,
  ): Promise<number | undefined> {
    if (!source) {
      return undefined;
    }

    const resolvedId = await this.sourcesService.findIdByName(source);
    return resolvedId ?? undefined;
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
