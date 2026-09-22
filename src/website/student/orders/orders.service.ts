import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { OrdersRepository } from '../../../shared/orders/repositories/orders.repository';
import { OrderEntity } from '../../../shared/orders/entities/order.entity';
import { CourseEntity } from '../../../staff/staff-dashboard/courses/entities/course.entity';
import { OrderStatusEnum } from '../../../shared/orders/enums/order-status.enum';
import { OrderCreatorTypeEnum } from '../../../shared/orders/enums/order-creator-type.enum';
import { PaymentMethodEnum } from '../../../shared/payment/enums/payment-method.enum';
import { PaymentStatusEnum } from '../../../shared/payment/enums/payment-status.enum';
import { PaginationResponseDto as PaginationResponse } from '../../../common/dto/responses/pagination.response';
import { IdempotencyService } from '../../../shared/idempotency/idempotency.service';
import { IdempotencyStatusEnum } from '../../../shared/idempotency/enums/idempotency-status.enum';
import { QueryStudentOrderRequest } from './dto/requests/query-student-order.request';
import { CreateStudentOrderRequest } from './dto/requests/create-student-order.request';
import { StudentOrderResponse } from './dto/responses/student-order.response';
import { StudentOrderDetailsResponse } from './dto/responses/student-order-details.response';

/** Namespaces the idempotency key so it can't collide with other endpoints. */
const CREATE_ORDER_IDEMPOTENCY_SCOPE = 'student-orders.create';

@Injectable()
export class StudentOrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly i18n: I18nService,
    private readonly idempotencyService: IdempotencyService,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates an order for the authenticated student.
   *
   * `idempotencyKey` (the client-generated `Idempotency-Key` header) is
   * required and enforced at the database level: the lock row and the order
   * itself are written in the same transaction, so
   *  - a retry with the same key after success replays the stored response
   *    instead of creating a second order;
   *  - a retry while the first attempt is still running is rejected (409);
   *  - if anything fails (course not found, duplicate unpaid order, ...) the
   *    whole transaction rolls back, including the lock row itself, so the
   *    same key can be retried with no leftover state.
   */
  async create(
    studentId: number,
    dto: CreateStudentOrderRequest,
    lang: string,
    idempotencyKey: string,
  ): Promise<StudentOrderDetailsResponse> {
    if (!idempotencyKey) {
      throw new BadRequestException(
        this.i18n.t('errors.IDEMPOTENCY_KEY_REQUIRED', { lang }),
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const { record, acquired } = await this.idempotencyService.acquire(
        idempotencyKey,
        CREATE_ORDER_IDEMPOTENCY_SCOPE,
        studentId,
        manager,
      );

      if (!acquired) {
        // Same key seen before — reject the repeat instead of creating a second order
        throw new ConflictException(
          record.status === IdempotencyStatusEnum.COMPLETED
            ? this.i18n.t('errors.IDEMPOTENCY_DUPLICATE_REQUEST', { lang })
            : this.i18n.t('errors.IDEMPOTENCY_REQUEST_IN_PROGRESS', { lang }),
        );
      }

      const response = await this.createOrder(manager, studentId, dto, lang);

      await this.idempotencyService.complete(record.id, 201, response, manager);

      return response;
    });
  }

  /** The actual order-creation business logic, run inside the caller's transaction. */
  private async createOrder(
    manager: EntityManager,
    studentId: number,
    dto: CreateStudentOrderRequest,
    lang: string,
  ): Promise<StudentOrderDetailsResponse> {
    const orderRepo = manager.getRepository(OrderEntity);

    const course = await manager.getRepository(CourseEntity).findOne({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException(
        this.i18n.t('errors.COURSE_NOT_FOUND', { lang }),
      );
    }

    const existingUnpaidOrder = await orderRepo
      .createQueryBuilder('order')
      .where('order.student_id = :studentId', { studentId })
      .andWhere('order.course_id = :courseId', { courseId: course.id })
      .andWhere('order.status = :status', { status: OrderStatusEnum.PENDING })
      .getOne();

    if (existingUnpaidOrder) {
      throw new ConflictException(
        this.i18n.t('errors.ORDER_ALREADY_EXISTS_FOR_COURSE', { lang }),
      );
    }

    const coursePrice = Number(course.price);

    const order = orderRepo.create({
      studentId,
      roundId: undefined,
      courseId: course.id,
      trainerId: course.trainerId,
      mainPrice: coursePrice,
      finalPrice: coursePrice,
      priceAfterDiscount: coursePrice,
      paymentMethod: PaymentMethodEnum.CASH,
      paymentStatus: PaymentStatusEnum.PENDING,
      status: OrderStatusEnum.PENDING,
      createdBy: OrderCreatorTypeEnum.STUDENT,
      createdById: studentId,
      notes: dto.notes,
    });

    const saved = await orderRepo.save(order);

    const withRelations = await orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.round', 'round')
      .where('order.id = :id', { id: saved.id })
      .getOne();

    return StudentOrderDetailsResponse.fromEntity(withRelations!, lang);
  }

  async findAll(
    studentId: number,
    query: QueryStudentOrderRequest,
    lang: string,
  ): Promise<PaginationResponse<StudentOrderResponse>> {
    const { page = 1, limit = 10, status, sortOrder = 'DESC' } = query;

    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.round', 'round')
      .where('order.student_id = :studentId', { studentId });

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.audit.createdAt', sortOrder);

    const [entities, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((e) => StudentOrderResponse.fromEntity(e, lang));
    return PaginationResponse.success(data, total, page, limit);
  }

  async findOne(
    studentId: number,
    id: string,
    lang: string,
  ): Promise<StudentOrderDetailsResponse> {
    const order = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.round', 'round')
      .where('order.id = :id', { id })
      .andWhere('order.student_id = :studentId', { studentId })
      .getOne();

    if (!order) {
      throw new NotFoundException(
        this.i18n.t('errors.ORDER_NOT_FOUND', { lang }),
      );
    }

    return StudentOrderDetailsResponse.fromEntity(order, lang);
  }
}
