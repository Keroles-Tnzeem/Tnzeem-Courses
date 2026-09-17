import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../../staff-dashboard/courses/entities/course.entity';
import { InstructorCoursesService } from './courses.service';
import { InstructorCoursesController } from './courses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity])],
  controllers: [InstructorCoursesController],
  providers: [InstructorCoursesService],
  exports: [InstructorCoursesService],
})
export class InstructorCoursesModule {}
