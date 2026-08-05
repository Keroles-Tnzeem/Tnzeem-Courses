import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseCategoryEntity } from '../../../staff-dashboard/course-categories/entities/course-category.entity';

@Injectable()
export class GuestCourseCategoriesService {
    constructor(
        @InjectRepository(CourseCategoryEntity)
        private readonly courseCategoryRepository: Repository<CourseCategoryEntity>,
    ) {}

    async findAll(): Promise<CourseCategoryEntity[]> {
        return await this.courseCategoryRepository.find({
            order: { id: 'DESC' },
        });
    }
}
