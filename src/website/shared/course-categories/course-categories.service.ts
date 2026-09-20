import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseCategoryEntity } from '../../../staff/staff-dashboard/course-categories/entities/course-category.entity';

@Injectable()
export class GuestCourseCategoriesService {
  constructor(
    @InjectRepository(CourseCategoryEntity)
    private readonly courseCategoryRepository: Repository<CourseCategoryEntity>,
  ) {}

  async findAll(): Promise<CourseCategoryEntity[]> {
    return await this.courseCategoryRepository
      .createQueryBuilder('category')
      .loadRelationCountAndMap('category.coursesNum', 'category.courses', 'course')
      .orderBy('category.id', 'DESC')
      .getMany();
  }
}
