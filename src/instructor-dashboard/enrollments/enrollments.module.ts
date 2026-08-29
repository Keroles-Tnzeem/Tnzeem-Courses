import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from '../../shared/enrollments/entities/enrollment.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { InstructorEnrollmentsController } from './enrollments.controller';
import { InstructorEnrollmentsService } from './enrollments.service';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentEntity, RoundEntity])],
  controllers: [InstructorEnrollmentsController],
  providers: [InstructorEnrollmentsService],
  exports: [InstructorEnrollmentsService],
})
export class InstructorEnrollmentsModule {}
