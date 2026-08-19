import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../../../staff-dashboard/courses/entities/course.entity';
import { QueryCoursesRequest } from './dto/requests/query-courses.request';

@Injectable()
export class GuestCoursesService {
    constructor(
        @InjectRepository(CourseEntity)
        private readonly courseRepository: Repository<CourseEntity>,
    ) {}

    async findAll(query: QueryCoursesRequest): Promise<CourseEntity[]> {
        const { categoryId } = query;

        const qb = this.courseRepository
            .createQueryBuilder('course')
            .leftJoinAndSelect('course.trainer', 'trainer')
            .leftJoinAndSelect('course.category', 'category');

        if (categoryId) {
            qb.andWhere('course.category_id = :categoryId', { categoryId });
        }

        qb.orderBy('course.id', 'DESC');

        return qb.getMany();
    }

    async findOneBySlug(slug: string): Promise<CourseEntity | null> {
        return await this.courseRepository.findOne({
            where: { slug },
            relations: ['trainer', 'category'],
        });
    }
}
