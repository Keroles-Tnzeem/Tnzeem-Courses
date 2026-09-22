import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule as SharedOrdersModule } from '../../../shared/orders/orders.module';
import { IdempotencyModule } from '../../../shared/idempotency/idempotency.module';
import { CourseEntity } from '../../../staff/staff-dashboard/courses/entities/course.entity';
import { StudentOrdersService } from './orders.service';
import { StudentOrdersController } from './orders.controller';

@Module({
  imports: [
    SharedOrdersModule,
    IdempotencyModule,
    TypeOrmModule.forFeature([CourseEntity]),
  ],
  controllers: [StudentOrdersController],
  providers: [StudentOrdersService],
})
export class StudentOrdersModule {}
