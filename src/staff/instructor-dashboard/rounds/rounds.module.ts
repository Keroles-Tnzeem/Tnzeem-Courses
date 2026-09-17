import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { CourseEntity } from '../../staff-dashboard/courses/entities/course.entity';
import { InstructorRoundsController } from './rounds.controller';
import { InstructorRoundsService } from './rounds.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoundEntity, CourseEntity])],
  controllers: [InstructorRoundsController],
  providers: [InstructorRoundsService],
  exports: [InstructorRoundsService],
})
export class InstructorRoundsModule {}
