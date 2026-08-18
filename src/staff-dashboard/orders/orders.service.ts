import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { OrdersRepository } from '../../shared/orders/repositories/orders.repository';
import { OrderCreatorTypeEnum } from '../../shared/orders/enums/order-creator-type.enum';
import { OrderStatusEnum } from '../../shared/orders/enums/order-status.enum';
import { PaymentStatusEnum } from '../../shared/payment/enums/payment-status.enum';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';
import { RoundsService } from '../rounds/rounds.service';
import { EnrollmentsService } from '../../shared/enrollments/enrollments.service';
import { EnrollmentStatusEnum } from '../../shared/enrollments/enums/enrollment-status.enum';
import { CreateOrderRequest } from './dto/requests/create-order.request';
import { UpdateOrderRequest } from './dto/requests/update-order.request';
import { QueryOrderRequest } from './dto/requests/query-order.request';
import { OrderResponse } from './dto/responses/order.response';
import { getLang } from '../../common/helpers/lang.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderCommentEntity } from '../order-comments/entities/order-comment.entity';

@Injectable()
export class OrdersService {
    constructor(
        private readonly ordersRepository: OrdersRepository,
        private readonly roundsService: RoundsService,
        private readonly enrollmentsService: EnrollmentsService,
        private readonly i18n: I18nService,
        @InjectRepository(OrderCommentEntity)
        private readonly orderCommentRepository: Repository<OrderCommentEntity>,
    ) {}

    /** Fetch the last comment text for a given comment id */
    private async fetchLastCommentText(lastCommentId?: number): Promise<string | null> {
        if (!lastCommentId) return null;
        const comment = await this.orderCommentRepository.findOne({ where: { id: lastCommentId } });
        return comment?.comment ?? null;
    }


    async create(
        dto: CreateOrderRequest,
        staffId: number,
        transferBankImgUrl?: string,
    ): Promise<OrderResponse> {
        // Fetch the round (with its course) to pull the price snapshot
        const round = await this.roundsService.findOne(dto.roundId);

        if (!round.course) {
            throw new NotFoundException(
                this.i18n.t('errors.COURSE_NOT_FOUND', { lang: getLang() }),
            );
        }

        const coursePrice = Number(round.course.price);
        const trainerId = round.course.trainerId;
        const courseId = round.courseId;

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

        const lastCommentText = await this.fetchLastCommentText(withRelations?.lastCommentId);
        (withRelations as any).lastComment = lastCommentText ? { comment: lastCommentText } : undefined;

        return OrderResponse.fromEntity(withRelations!, getLang());
    }

    // ── Find All (paginated)

    async findAll(query: QueryOrderRequest): Promise<PaginationResponse<OrderResponse>> {
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

        if (roundId) {
            qb.andWhere('order.round_id = :roundId', { roundId });
        }

        if (trainerId) {
            qb.andWhere('order.trainer_id = :trainerId', { trainerId });
        }

        if (assignToId) {
            qb.andWhere('order.assign_to_id = :assignToId', { assignToId });
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
                endDate: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
            });
        }

        // Sorting
        const sortColumn = sortBy === 'finalPrice'
            ? 'order.finalPrice'
            : 'order.audit.createdAt';
        qb.orderBy(sortColumn, sortOrder);

        const [entities, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        // Attach last comment text for each order
        const commentIds = entities.map(e => e.lastCommentId).filter(Boolean) as number[];
        const comments = commentIds.length
            ? await this.orderCommentRepository.findByIds(commentIds)
            : [];
        const commentMap = new Map(comments.map(c => [c.id, c.comment]));

        for (const entity of entities) {
            if (entity.lastCommentId) {
                (entity as any).lastComment = { comment: commentMap.get(entity.lastCommentId) ?? null };
            }
        }

        const data = entities.map(e => OrderResponse.fromEntity(e, getLang()));
        return PaginationResponse.success(data, total, page, limit);
    }


    async findOne(id: string): Promise<OrderResponse> {
        const order = await this.ordersRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.student', 'student')
            .leftJoinAndSelect('order.trainer', 'trainer')
            .leftJoinAndSelect('order.round', 'round')
            .leftJoinAndSelect('order.course', 'course')
            .leftJoinAndSelect('order.assignTo', 'assignTo')
            .where('order.id = :id', { id })
            .getOne();

        if (!order) {
            throw new NotFoundException(
                this.i18n.t('errors.ORDER_NOT_FOUND', { lang: getLang() }),
            );
        }

        const lastCommentText = await this.fetchLastCommentText(order.lastCommentId);
        (order as any).lastComment = lastCommentText ? { comment: lastCommentText } : undefined;

        return OrderResponse.fromEntity(order, getLang());
    }


    async update(
        id: string,
        dto: UpdateOrderRequest,
        transferBankImgUrl?: string,
    ): Promise<OrderResponse> {
        const order = await this.ordersRepository.findOne({ where: { id } });

        if (!order) {
            throw new NotFoundException(
                this.i18n.t('errors.ORDER_NOT_FOUND', { lang: getLang() }),
            );
        }

        if (dto.status !== undefined) {
            order.status = dto.status;

            // Auto-update payment status and paidAt based on order status
            if (dto.status === OrderStatusEnum.CONFIRMED) {
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
                order.paymentStatus = PaymentStatusEnum.CANCELLED;
            }
        }

        if (dto.paymentType !== undefined) order.paymentType = dto.paymentType;
        if (dto.paymentMethod !== undefined) order.paymentMethod = dto.paymentMethod;
        if (dto.paymentStatus !== undefined) order.paymentStatus = dto.paymentStatus;
        if (dto.paymentNotes !== undefined) order.paymentNotes = dto.paymentNotes;
        if (dto.paidAt !== undefined) order.paidAt = new Date(dto.paidAt);
        if (transferBankImgUrl !== undefined) order.transferBankImg = transferBankImgUrl;
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

        const lastCommentText = await this.fetchLastCommentText(withRelations?.lastCommentId);
        (withRelations as any).lastComment = lastCommentText ? { comment: lastCommentText } : undefined;

        return OrderResponse.fromEntity(withRelations!, getLang());
    }

    // ── Cancel (soft delete via status)

    async cancel(id: string): Promise<void> {
        const order = await this.ordersRepository.findOne({ where: { id } });

        if (!order) {
            throw new NotFoundException(
                this.i18n.t('errors.ORDER_NOT_FOUND', { lang: getLang() }),
            );
        }

        order.status = OrderStatusEnum.CANCELLED;
        order.paymentStatus = PaymentStatusEnum.CANCELLED;
        await this.ordersRepository.save(order);
    }
}

