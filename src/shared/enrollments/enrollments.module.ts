import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { EnrollmentsRepository } from './repositories/enrollments.repository';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { UserEntity } from '../user/entities/user.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { OrderEntity } from '../orders/entities/order.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnrollmentEntity,
            UserEntity,
            RoundEntity,
            OrderEntity,
        ]),
    ],
    controllers: [
        EnrollmentsController,
    ],
    providers: [
        EnrollmentsRepository,
        EnrollmentsService,
    ],
    exports: [
        EnrollmentsRepository,
        EnrollmentsService,
    ],
})
export class EnrollmentsModule {}
