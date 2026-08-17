import { ApiProperty } from '@nestjs/swagger';
import { OrderCommentEntity } from '../../entities/order-comment.entity';

export class OrderCommentResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    orderId: string;

    @ApiProperty()
    staffId: number;

    @ApiProperty()
    comment: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    constructor(entity: OrderCommentEntity) {
        this.id = entity.id;
        this.orderId = entity.orderId;
        this.staffId = entity.staffId;
        this.comment = entity.comment;
        this.createdAt = entity.audit.createdAt;
        this.updatedAt = entity.audit.updatedAt;
    }
}
