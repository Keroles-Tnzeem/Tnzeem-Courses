import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule as SharedOrdersModule } from '../../shared/orders/orders.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { RoundsModule } from '../rounds/rounds.module';
import { EnrollmentsModule } from '../../shared/enrollments/enrollments.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderCommentEntity } from '../order-comments/entities/order-comment.entity';
import { CourseEntity } from '../courses/entities/course.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderCommentEntity, CourseEntity]),
        SharedOrdersModule, // provides OrdersRepository
        StorageModule,      // provides StorageService
        RoundsModule,       // provides RoundsService (round → course → price)
        EnrollmentsModule,  // provides EnrollmentsService
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class StaffOrdersModule {}
