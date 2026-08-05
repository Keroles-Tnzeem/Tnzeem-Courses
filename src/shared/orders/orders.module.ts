import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrdersRepository } from './repositories/orders.repository';
import { UserEntity } from '../user/entities/user.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { CourseEntity } from '../../staff-dashboard/courses/entities/course.entity';

import { PaymentModule } from '../payment/payment.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrderEntity,
            UserEntity,
            RoundEntity,
            CourseEntity,
        ]),
        forwardRef(() => PaymentModule),
    ],
    providers: [
        OrdersRepository,
    ],
    exports: [
        OrdersRepository,
    ],
})
export class OrdersModule {}
