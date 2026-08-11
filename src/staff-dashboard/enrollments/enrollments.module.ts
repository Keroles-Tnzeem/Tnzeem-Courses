import { Module } from '@nestjs/common';
import { EnrollmentsModule as SharedEnrollmentsModule } from '../../shared/enrollments/enrollments.module';
import { EnrollmentsController } from './enrollments.controller';

@Module({
    imports: [
        SharedEnrollmentsModule, // provides EnrollmentsService and EnrollmentsRepository
    ],
    controllers: [EnrollmentsController],
})
export class StaffEnrollmentsModule {}
