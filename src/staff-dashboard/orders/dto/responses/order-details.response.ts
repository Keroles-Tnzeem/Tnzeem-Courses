import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderEntity } from '../../../../shared/orders/entities/order.entity';
import { OrderCommentEntity } from '../../../order-comments/entities/order-comment.entity';
import { OrderResponse } from './order.response';

export class OrderCommentInDetails {
    @ApiPropertyOptional()
    id: number;

    @ApiPropertyOptional()
    staffId: number;

    @ApiPropertyOptional({ description: 'Staff basic info' })
    staff?: {
        firstName: string;
        lastName: string;
    };

    @ApiPropertyOptional()
    comment: string;

    @ApiPropertyOptional()
    createdAt: Date;

    @ApiPropertyOptional()
    updatedAt: Date;

    static fromEntity(entity: OrderCommentEntity): OrderCommentInDetails {
        const response = new OrderCommentInDetails();
        response.id = entity.id;
        response.staffId = entity.staffId;
        response.comment = entity.comment;
        response.createdAt = entity.audit?.createdAt;
        response.updatedAt = entity.audit?.updatedAt;

        if (entity.staff) {
            response.staff = {
                firstName: entity.staff.firstName,
                lastName: entity.staff.lastName,
            };
        }

        return response;
    }
}

export class OrderDetailsResponse extends OrderResponse {
    @ApiPropertyOptional({
        description: 'All comments related to this order',
        type: [OrderCommentInDetails],
    })
    comments?: OrderCommentInDetails[];

    static fromEntityWithComments(
        entity: OrderEntity,
        comments: OrderCommentEntity[],
        lang: string = 'en',
    ): OrderDetailsResponse {
        // Build the base response first
        const base = OrderResponse.fromEntity(entity, lang);

        // Copy all base fields into a new OrderDetailsResponse instance
        const response = Object.assign(new OrderDetailsResponse(), base);

        // Map comments
        response.comments = comments.map(c => OrderCommentInDetails.fromEntity(c));

        return response;
    }
}
