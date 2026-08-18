import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderCommentEntity } from './entities/order-comment.entity';
import { OrderEntity } from '../../shared/orders/entities/order.entity';
import { CreateOrderCommentRequest } from './dto/requests/create-order-comment.request';
import { UpdateOrderCommentRequest } from './dto/requests/update-order-comment.request';
import { QueryOrderCommentRequest } from './dto/requests/query-order-comment.request';
import { OrderCommentResponse } from './dto/responses/order-comment.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class OrderCommentsService {
    constructor(
        @InjectRepository(OrderCommentEntity)
        private readonly orderCommentRepository: Repository<OrderCommentEntity>,
        @InjectRepository(OrderEntity)
        private readonly orderRepository: Repository<OrderEntity>,
        private readonly i18n: I18nService,
    ) {}

    async create(staffId: number, dto: CreateOrderCommentRequest): Promise<OrderCommentResponse> {
        const order = await this.orderRepository.findOne({ where: { id: dto.orderId } });
        if (!order) {
            throw new NotFoundException(this.i18n.t('orders.not_found'));
        }

        const comment = this.orderCommentRepository.create({
            orderId: dto.orderId,
            staffId,
            comment: dto.comment,
        });

        const savedComment = await this.orderCommentRepository.save(comment);

        const commentWithStaff = await this.orderCommentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['staff'],
        });

        await this.orderRepository.update(dto.orderId, {
            lastCommentId: savedComment.id,
            lastCommentDate: savedComment.audit.createdAt,
        });

        return OrderCommentResponse.fromEntity(commentWithStaff!);
    }

    async findAll(query: QueryOrderCommentRequest): Promise<PaginationResponseDto<OrderCommentResponse>> {
        const qb = this.orderCommentRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.staff', 'staff');

        if (query.orderId) {
            qb.andWhere('comment.orderId = :orderId', { orderId: query.orderId });
        }

        // Handle sort with audit columns
        const sortBy = query.sortBy === 'createdAt' ? 'audit.createdAt' : query.sortBy;
        qb.orderBy(`comment.${sortBy}`, query.order as 'ASC' | 'DESC');

        const page = query.page || 1;
        const limit = query.limit || 10;

        const [items, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const mappedItems = items.map(item => OrderCommentResponse.fromEntity(item));
        return new PaginationResponseDto(true, mappedItems, total, page, limit);
    }

    async findOne(id: number): Promise<OrderCommentResponse> {
        const comment = await this.orderCommentRepository.findOne({ 
            where: { id },
            relations: ['staff'],
        });
        if (!comment) {
            throw new NotFoundException(this.i18n.t('order_comments.not_found', { defaultValue: 'Order comment not found' }));
        }
        return OrderCommentResponse.fromEntity(comment);
    }

    async update(id: number, dto: UpdateOrderCommentRequest): Promise<OrderCommentResponse> {
        const comment = await this.orderCommentRepository.findOne({ 
            where: { id },
            relations: ['staff'],
        });
        if (!comment) {
            throw new NotFoundException(this.i18n.t('order_comments.not_found', { defaultValue: 'Order comment not found' }));
        }

        comment.comment = dto.comment;
        const updated = await this.orderCommentRepository.save(comment);
        
        return OrderCommentResponse.fromEntity(updated);
    }

    async remove(id: number): Promise<void> {
        const comment = await this.orderCommentRepository.findOne({ where: { id } });
        if (!comment) {
            throw new NotFoundException(this.i18n.t('order_comments.not_found', { defaultValue: 'Order comment not found' }));
        }

        await this.orderCommentRepository.remove(comment);
    }
}
