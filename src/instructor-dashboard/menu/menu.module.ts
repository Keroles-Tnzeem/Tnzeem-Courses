import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorMenuController } from './menu.controller';
import { InstructorMenuService } from './menu.service';
import { CourseEntity } from '../../staff-dashboard/courses/entities/course.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, RoundEntity]),
  ],
  controllers: [InstructorMenuController],
  providers: [InstructorMenuService],
})
export class InstructorMenuModule { }
