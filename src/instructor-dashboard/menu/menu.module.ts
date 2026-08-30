import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorMenuController } from './menu.controller';
import { InstructorMenuService } from './menu.service';
import { CourseEntity } from '../../staff-dashboard/courses/entities/course.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { CourseCategoryEntity } from '../../staff-dashboard/course-categories/entities/course-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, RoundEntity, CourseCategoryEntity]),
  ],
  controllers: [InstructorMenuController],
  providers: [InstructorMenuService],
})
export class InstructorMenuModule { }
