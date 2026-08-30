import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestCourseCategoriesService } from './course-categories.service';
import { GuestCourseCategoriesController } from './course-categories.controller';
import { CourseCategoryEntity } from '../../../staff-dashboard/course-categories/entities/course-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCategoryEntity])],
  controllers: [GuestCourseCategoriesController],
  providers: [GuestCourseCategoriesService],
})
export class GuestCourseCategoriesModule {}
