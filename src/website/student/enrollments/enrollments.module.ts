import { Module } from '@nestjs/common';
import { EnrollmentsModule as SharedEnrollmentsModule } from '../../../shared/enrollments/enrollments.module';
import { StudentEnrollmentsService } from './enrollments.service';
import { StudentEnrollmentsController } from './enrollments.controller';

@Module({
  imports: [SharedEnrollmentsModule],
  controllers: [StudentEnrollmentsController],
  providers: [StudentEnrollmentsService],
})
export class StudentEnrollmentsModule {}
