import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../../../staff/staff-dashboard/courses/entities/course.entity';
import { CourseStatusEnum } from '../../../staff/staff-dashboard/courses/enums/course-status.enum';
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
      .leftJoinAndSelect('course.category', 'category')
      .where('course.status = :status', { status: CourseStatusEnum.PUBLISHED });

    if (categoryId) {
      qb.andWhere('course.category_id = :categoryId', { categoryId });
    }

    qb.orderBy('course.id', 'DESC');

    return qb.getMany();
  }

  async findLatest(limit = 6): Promise<CourseEntity[]> {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.trainer', 'trainer')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.status = :status', { status: CourseStatusEnum.PUBLISHED })
      .orderBy('course.id', 'DESC')
      .take(limit)
      .getMany();
  }

  async findOneBySlug(slug: string): Promise<CourseEntity | null> {
    let decodedSlug = slug;
    try {
      decodedSlug = decodeURIComponent(slug);
    } catch {
      decodedSlug = slug;
    }

    const isNumeric = /^\d+$/.test(slug);

    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.trainer', 'trainer')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.status = :status', { status: CourseStatusEnum.PUBLISHED });

    if (isNumeric) {
      qb.andWhere(
        '(course.slug = :slug OR course.slug = :decodedSlug OR course.id = :id)',
        {
          slug,
          decodedSlug,
          id: Number(slug),
        },
      );
    } else {
      qb.andWhere('(course.slug = :slug OR course.slug = :decodedSlug)', {
        slug,
        decodedSlug,
      });
    }

    return await qb.getOne();
  }
}
