import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderCommentEntity } from '../../entities/order-comment.entity';

export class OrderCommentResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderId: string;

    @ApiProperty()
    staffId: number;

    @ApiPropertyOptional({ description: 'Staff basic info' })
    staff?: {
        firstName: string;
        lastName: string;
    };

    @ApiProperty()
    comment: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static fromEntity(entity: OrderCommentEntity): OrderCommentResponse {
        const response = new OrderCommentResponse();
        response.id = entity.id;
        response.orderId = entity.orderId;
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
