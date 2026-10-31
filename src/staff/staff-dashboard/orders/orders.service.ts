import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { OrdersRepository } from '../../../shared/orders/repositories/orders.repository';
import { OrderCreatorTypeEnum } from '../../../shared/orders/enums/order-creator-type.enum';
import { OrderStatusEnum } from '../../../shared/orders/enums/order-status.enum';
import { PaymentStatusEnum } from '../../../shared/payment/enums/payment-status.enum';
import { PaginationResponseDto as PaginationResponse } from '../../../common/dto/responses/pagination.response';
import { RoundsService } from '../rounds/rounds.service';
import { EnrollmentsService } from '../../../shared/enrollments/enrollments.service';
import { EnrollmentStatusEnum } from '../../../shared/enrollments/enums/enrollment-status.enum';
import { CreateOrderRequest } from './dto/requests/create-order.request';
import { UpdateOrderRequest } from './dto/requests/update-order.request';
import { QueryOrderRequest } from './dto/requests/query-order.request';
import { OrderResponse } from './dto/responses/order.response';
import { OrderDetailsResponse } from './dto/responses/order-details.response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderCommentEntity } from '../order-comments/entities/order-comment.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { BadRequestException } from '@nestjs/common';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { NotificationTypeEnum } from '../../../shared/notifications/enums/notification-type.enum';
import { NotificationChannelEnum } from '../../../shared/notifications/enums/notification-channel.enum';
import { orderPaymentCompletedContent } from '../../../shared/notifications/templates/notification.templates';
import { renderOrderPaymentCompletedEmail } from '../../../shared/notifications/templates/order-payment-completed.html';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly roundsService: RoundsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly i18n: I18nService,
    @InjectRepository(OrderCommentEntity)
    private readonly orderCommentRepository: Repository<OrderCommentEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Sends ORDER_PAYMENT_COMPLETED through IN_APP and MAIL (pre-rendered HTML in `data.html`).
   * Never throws; delivery errors are swallowed by NotificationsService.notify().
   */
  private async sendPaymentCompletedNotification(
    order: {
      id: string;
      studentId: number;
      course?: { name?: { ar?: string; en?: string } } | null;
    },
    studentName: string,
  ): Promise<void> {
    const courseName = {
      en: order.course?.name?.en ?? order.course?.name?.ar ?? '',
      ar: order.course?.name?.ar ?? order.course?.name?.en ?? '',
    };
    const content = orderPaymentCompletedContent(courseName, order.id);
    const html = renderOrderPaymentCompletedEmail({
      studentName,
      orderId: order.id,
      courseName: courseName.ar,
    });

    await this.notificationsService.notify({
      userId: order.studentId,
      type: NotificationTypeEnum.ORDER_PAYMENT_COMPLETED,
      title: content.title,
      body: content.body,
      channels: [NotificationChannelEnum.IN_APP, NotificationChannelEnum.MAIL],
      data: { html, orderId: order.id },
    });
  }

  /** Fetch the last comment text for a given comment id */
  private async fetchLastCommentText(
    lastCommentId?: number,
  ): Promise<string | null> {
    if (!lastCommentId) return null;
    const comment = await this.orderCommentRepository.findOne({
      where: { id: lastCommentId },
    });
    return comment?.comment ?? null;
  }

  async create(
    dto: CreateOrderRequest,
    staffId: number,
    lang: string,
    transferBankImgUrl?: string,
  ): Promise<OrderResponse> {
    if (!dto.roundId && !dto.courseId) {
      throw new BadRequestException(
        this.i18n.t('errors.ROUND_OR_COURSE_REQUIRED', { lang }),
      );
    }

    let coursePrice = 0;
    let trainerId: number | null = null;
    let courseId = 0;

    if (dto.roundId) {
      const round = await this.roundsService.findOne(dto.roundId);
      if (!round.course) {
        throw new NotFoundException(
          this.i18n.t('errors.COURSE_NOT_FOUND', { lang }),
        );
      }
      coursePrice = Number(round.course.price);
      trainerId = round.course.trainerId ?? null;
      courseId = round.courseId;
    } else if (dto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: dto.courseId },
      });
      if (!course) {
        throw new NotFoundException(
          this.i18n.t('errors.COURSE_NOT_FOUND', { lang }),
        );
      }
      coursePrice = Number(course.price);
      trainerId = course.trainerId ?? null;
      courseId = course.id;
    }

    // priceAfterDiscount is set equal to finalPrice (discount feature skipped for now)
    const order = this.ordersRepository.create({
      studentId: dto.studentId,
      roundId: dto.roundId,
      courseId,
      trainerId,
      mainPrice: coursePrice,
      finalPrice: coursePrice,
      priceAfterDiscount: coursePrice,
      paymentType: dto.paymentType,
      paymentMethod: dto.paymentMethod,
      paymentNotes: dto.paymentNotes,
      transferBankImg: transferBankImgUrl,
      createdBy: dto.createdBy ?? OrderCreatorTypeEnum.STAFF,
      createdById: staffId,
      status: OrderStatusEnum.PENDING,
      notes: dto.notes,
    });

    const saved = await this.ordersRepository.save(order);

    const withRelations = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.student', 'student')
      .leftJoinAndSelect('order.trainer', 'trainer')
      .leftJoinAndSelect('order.round', 'round')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.assignTo', 'assignTo')
      .where('order.id = :id', { id: saved.id })
      .getOne();

    const lastCommentText = await this.fetchLastCommentText(
      withRelations?.lastCommentId,
    );
    (withRelations as any).lastComment = lastCommentText
      ? { comment: lastCommentText }
      : undefined;

    return OrderResponse.fromEntity(withRelations!, lang);
  }

  // ── Find All (paginated)

  async findAll(
    query: QueryOrderRequest,
    lang: string,
  ): Promise<PaginationResponse<OrderResponse>> {
    const {
      page = 1,
      limit = 10,
      keyword,
      studentId,
      roundId,
      trainerId,
      status,
      paymentType,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      assignToId,
      phone,
    } = query;

    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.student', 'student')
      .leftJoinAndSelect('order.trainer', 'trainer')
      .leftJoinAndSelect('order.round', 'round')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.assignTo', 'assignTo');

    if (keyword) {
      qb.andWhere(
        '(student.first_name ILIKE :keyword OR student.last_name ILIKE :keyword OR order.id ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (studentId) {
      qb.andWhere('order.student_id = :studentId', { studentId });
    }

    if (phone) {
      qb.andWhere('student.phone ILIKE :phone', { phone: `%${phone}%` });
    }

    if (roundId) {
      qb.andWhere('order.round_id = :roundId', { roundId });
    }

    if (trainerId !== undefined && trainerId !== null) {
      if (Number(trainerId) === 0) {
        qb.andWhere('order.trainer_id IS NULL');
      } else {
        qb.andWhere('order.trainer_id = :trainerId', { trainerId });
      }
    }

    if (assignToId !== undefined && assignToId !== null) {
      if (Number(assignToId) === 0) {
        qb.andWhere('order.assign_to_id IS NULL');
      } else {
        qb.andWhere('order.assign_to_id = :assignToId', { assignToId });
      }
    }

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    if (paymentType) {
      qb.andWhere('order.payment_type = :paymentType', { paymentType });
    }

    if (paymentMethod) {
      qb.andWhere('order.payment_method = :paymentMethod', { paymentMethod });
    }

    if (paymentStatus) {
      qb.andWhere('order.payment_status = :paymentStatus', { paymentStatus });
    }

    if (startDate) {
      qb.andWhere('order.created_at >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('order.created_at < :endDate', {
        endDate: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1),
        ),
      });
    }

    // Sorting
    const sortColumn =
      sortBy === 'finalPrice' ? 'order.finalPrice' : 'order.audit.createdAt';
    qb.orderBy(sortColumn, sortOrder);

    const [entities, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Attach last comment text for each order
    const commentIds = entities
      .map((e) => e.lastCommentId)
      .filter(Boolean) as number[];
    const comments = commentIds.length
      ? await this.orderCommentRepository.findByIds(commentIds)
      : [];
    const commentMap = new Map(comments.map((c) => [c.id, c.comment]));

    for (const entity of entities) {
      if (entity.lastCommentId) {
        (entity as any).lastComment = {
          comment: commentMap.get(entity.lastCommentId) ?? null,
        };
      }
    }

    const data = entities.map((e) => OrderResponse.fromEntity(e, lang));
    return PaginationResponse.success(data, total, page, limit);
  }

  // ── Find My Orders (paginated) ────────────────────────────────────────────

  async findMyOrders(
    staffId: number,
    query: QueryOrderRequest,
    lang: string,
  ): Promise<PaginationResponse<OrderResponse>> {
    return this.findAll({ ...query, assignToId: staffId }, lang);
  }

  async findOne(id: string, lang: string): Promise<OrderDetailsResponse> {
    const order = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.student', 'student')
      .leftJoinAndSelect('order.trainer', 'trainer')
      .leftJoinAndSelect('order.round', 'round')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.assignTo', 'assignTo')
      .where('order.id = :id', { id })
      .getOne();

    if (!order) {
      throw new NotFoundException(
        this.i18n.t('errors.ORDER_NOT_FOUND', { lang }),
      );
    }

    const lastCommentText = await this.fetchLastCommentText(
      order.lastCommentId,
    );
    (order as any).lastComment = lastCommentText
      ? { comment: lastCommentText }
      : undefined;

    const comments = await this.orderCommentRepository.find({
      where: { orderId: id },
      relations: ['staff'],
      order: { id: 'DESC' },
    });

    return OrderDetailsResponse.fromEntityWithComments(order, comments, lang);
  }

  async update(
    id: string,
    dto: UpdateOrderRequest,
    lang: string,
    transferBankImgUrl?: string,
  ): Promise<OrderResponse> {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(
        this.i18n.t('errors.ORDER_NOT_FOUND', { lang }),
      );
    }

    const previousPaymentStatus = order.paymentStatus;

    // The round must be settled first: confirming needs the final round.
    if (dto.roundId !== undefined && dto.roundId !== order.roundId) {
      // After confirmation the enrollment is tied to the round, so it can't move.
      if (
        order.status === OrderStatusEnum.CONFIRMED ||
        order.status === OrderStatusEnum.CANCELLED
      ) {
        throw new ConflictException(
          this.i18n.t('errors.ORDER_ROUND_LOCKED', { lang }),
        );
      }
      const round = await this.roundsService.findOne(dto.roundId);
      if (!round.course) {
        throw new NotFoundException(
          this.i18n.t('errors.COURSE_NOT_FOUND', { lang }),
        );
      }
      order.roundId = dto.roundId;
      order.courseId = round.courseId;
      order.trainerId = round.course.trainerId;
    }

    if (dto.status !== undefined && dto.status !== order.status) {
      this.assertStatusTransition(order.status, dto.status, lang);

      if (dto.status === OrderStatusEnum.CONFIRMED) {
        // An enrollment always belongs to a round.
        if (order.roundId == null) {
          throw new BadRequestException(
            this.i18n.t('errors.ORDER_ROUND_REQUIRED_TO_CONFIRM', { lang }),
          );
        }

        order.status = OrderStatusEnum.CONFIRMED;
        order.paymentStatus = PaymentStatusEnum.COMPLETED;
        order.paidAt = new Date();

        // Generate enrollment if it doesn't have one
        if (!order.hasEnrollment) {
          await this.enrollmentsService.create({
            studentId: order.studentId,
            roundId: order.roundId,
            orderId: order.id,
            status: EnrollmentStatusEnum.PENDING,
          });
          order.hasEnrollment = true;
        }
      } else if (dto.status === OrderStatusEnum.CANCELLED) {
        await this.guardAgainstCancellingCompletedEnrollment(order, lang);
        order.status = OrderStatusEnum.CANCELLED;
        order.paymentStatus = PaymentStatusEnum.CANCELLED;
      } else {
        order.status = dto.status;
      }
    }

    if (dto.paymentType !== undefined) order.paymentType = dto.paymentType;
    if (dto.paymentMethod !== undefined)
      order.paymentMethod = dto.paymentMethod;
    if (dto.paymentStatus !== undefined)
      order.paymentStatus = dto.paymentStatus;
    if (dto.paymentNotes !== undefined) order.paymentNotes = dto.paymentNotes;
    if (dto.paidAt !== undefined) order.paidAt = new Date(dto.paidAt);
    if (transferBankImgUrl !== undefined)
      order.transferBankImg = transferBankImgUrl;
    if (dto.assignToId !== undefined) order.assignToId = dto.assignToId;

    const updated = await this.ordersRepository.save(order);

    const withRelations = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.student', 'student')
      .leftJoinAndSelect('order.trainer', 'trainer')
      .leftJoinAndSelect('order.round', 'round')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.assignTo', 'assignTo')
      .where('order.id = :id', { id: updated.id })
      .getOne();

    const lastCommentText = await this.fetchLastCommentText(
      withRelations?.lastCommentId,
    );
    (withRelations as any).lastComment = lastCommentText
      ? { comment: lastCommentText }
      : undefined;

    // Notify only on the transition into COMPLETED, never on later edits.
    if (
      previousPaymentStatus !== PaymentStatusEnum.COMPLETED &&
      updated.paymentStatus === PaymentStatusEnum.COMPLETED
    ) {
      const studentName =
        `${withRelations?.student?.firstName ?? ''} ${withRelations?.student?.lastName ?? ''}`.trim();
      await this.sendPaymentCompletedNotification(
        { id: updated.id, studentId: updated.studentId, course: withRelations?.course },
        studentName,
      );
    }

    return OrderResponse.fromEntity(withRelations!, lang);
  }

  // ── Delete (hard delete with comments) ────────────────────────────────────

  async delete(id: string, lang: string): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(
        this.i18n.t('errors.ORDER_NOT_FOUND', { lang }),
      );
    }

    // Explicitly delete associated order comments
    await this.orderCommentRepository.delete({ orderId: id });

    // Hard delete the order
    await this.ordersRepository.remove(order);
  }

  async cancel(id: string, lang: string): Promise<void> {
    return this.delete(id, lang);
  }

  // ── Rules

  /** PENDING -> CONFIRMED | CANCELLED | TRACKING | NO_RESPONSE_*, CONFIRMED -> CANCELLED. CANCELLED is final. */
  private assertStatusTransition(
    from: OrderStatusEnum,
    to: OrderStatusEnum,
    lang: string,
  ): void {
    const unconfirmedStatuses = [
      OrderStatusEnum.PENDING,
      OrderStatusEnum.TRACKING,
      OrderStatusEnum.NO_RESPONSE_1,
      OrderStatusEnum.NO_RESPONSE_2,
      OrderStatusEnum.NO_RESPONSE_3,
      OrderStatusEnum.NO_RESPONSE_4,
    ];

    const allowed: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      [OrderStatusEnum.PENDING]: [
        OrderStatusEnum.CONFIRMED,
        OrderStatusEnum.CANCELLED,
        OrderStatusEnum.TRACKING,
        OrderStatusEnum.NO_RESPONSE_1,
        OrderStatusEnum.NO_RESPONSE_2,
        OrderStatusEnum.NO_RESPONSE_3,
        OrderStatusEnum.NO_RESPONSE_4,
      ],
      [OrderStatusEnum.TRACKING]: [
        OrderStatusEnum.CONFIRMED,
        OrderStatusEnum.CANCELLED,
        OrderStatusEnum.PENDING,
        OrderStatusEnum.NO_RESPONSE_1,
        OrderStatusEnum.NO_RESPONSE_2,
        OrderStatusEnum.NO_RESPONSE_3,
        OrderStatusEnum.NO_RESPONSE_4,
      ],
      [OrderStatusEnum.NO_RESPONSE_1]: [
        OrderStatusEnum.CONFIRMED,
        OrderStatusEnum.CANCELLED,
        OrderStatusEnum.PENDING,
        OrderStatusEnum.TRACKING,
        OrderStatusEnum.NO_RESPONSE_2,
        OrderStatusEnum.NO_RESPONSE_3,
        OrderStatusEnum.NO_RESPONSE_4,
      ],
      [OrderStatusEnum.NO_RESPONSE_2]: [
        OrderStatusEnum.CONFIRMED,
        OrderStatusEnum.CANCELLED,
        OrderStatusEnum.PENDING,
        OrderStatusEnum.TRACKING,
        OrderStatusEnum.NO_RESPONSE_1,
        OrderStatusEnum.NO_RESPONSE_3,
        OrderStatusEnum.NO_RESPONSE_4,
      ],
      [OrderStatusEnum.NO_RESPONSE_3]: [
        OrderStatusEnum.CONFIRMED,
        OrderStatusEnum.CANCELLED,
        OrderStatusEnum.PENDING,
        OrderStatusEnum.TRACKING,
        OrderStatusEnum.NO_RESPONSE_1,
        OrderStatusEnum.NO_RESPONSE_2,
        OrderStatusEnum.NO_RESPONSE_4,
      ],
      [OrderStatusEnum.NO_RESPONSE_4]: [
        OrderStatusEnum.CONFIRMED,
        OrderStatusEnum.CANCELLED,
        OrderStatusEnum.PENDING,
        OrderStatusEnum.TRACKING,
        OrderStatusEnum.NO_RESPONSE_1,
        OrderStatusEnum.NO_RESPONSE_2,
        OrderStatusEnum.NO_RESPONSE_3,
      ],
      [OrderStatusEnum.CONFIRMED]: [OrderStatusEnum.CANCELLED],
      [OrderStatusEnum.CANCELLED]: [],
    };
    if (!allowed[from].includes(to)) {
      throw new ConflictException(
        this.i18n.t('errors.ORDER_INVALID_STATUS_TRANSITION', { lang }),
      );
    }
  }

  /**
   * Cancelling an order only changes its status — the enrollment it created
   * is left untouched (never deleted), so cancellation stays reversible.
   * A completed enrollment (certificate issued) still blocks cancellation.
   */
  private async guardAgainstCancellingCompletedEnrollment(
    order: { id: string },
    lang: string,
  ): Promise<void> {
    const enrollment = await this.enrollmentsService.findByOrderId(order.id);
    if (enrollment?.status === EnrollmentStatusEnum.COMPLETED) {
      throw new ConflictException(
        this.i18n.t('errors.ORDER_CANNOT_CANCEL_COMPLETED', { lang }),
      );
    }
  }
}
