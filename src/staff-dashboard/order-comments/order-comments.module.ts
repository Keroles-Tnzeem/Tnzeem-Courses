import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderCommentsController } from './order-comments.controller';
import { OrderCommentsService } from './order-comments.service';
import { OrderCommentEntity } from './entities/order-comment.entity';
import { OrderEntity } from '../../shared/orders/entities/order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OrderCommentEntity, OrderEntity])],
    controllers: [OrderCommentsController],
    providers: [OrderCommentsService],
    exports: [OrderCommentsService],
})
export class OrderCommentsModule {}
