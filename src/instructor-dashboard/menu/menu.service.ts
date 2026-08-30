import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../../staff-dashboard/courses/entities/course.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { CourseCategoryEntity } from '../../staff-dashboard/course-categories/entities/course-category.entity';
import { parseJson } from '../../common/helpers/parse-json.helper';
import { CourseMenuResponse } from './dto/responses/course-menu.response';
import { RoundMenuResponse } from './dto/responses/round-menu.response';
import { CourseCategoryMenuResponse } from './dto/responses/course-category-menu.response';

@Injectable()
export class InstructorMenuService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(RoundEntity)
    private readonly roundRepository: Repository<RoundEntity>,
    @InjectRepository(CourseCategoryEntity)
    private readonly courseCategoryRepository: Repository<CourseCategoryEntity>,
  ) {}

  async getCoursesMenu(trainerId: number, lang: string): Promise<CourseMenuResponse[]> {
    const courses = await this.courseRepository.find({
      where: { trainerId },
      select: ['id', 'name'],
    });

    return courses.map((course) => {
      const nameObj = parseJson<Record<string, string>>(course.name);
      return {
        id: course.id,
        name: nameObj[lang] ?? nameObj['en'] ?? course.name,
      };
    });
  }

  async getRoundsMenu(trainerId: number, lang: string): Promise<RoundMenuResponse[]> {
    const rounds = await this.roundRepository
      .createQueryBuilder('round')
      .innerJoinAndSelect('round.course', 'course')
      .where('course.trainer_id = :trainerId', { trainerId })
      .select([
        'round.id',
        'round.roundNumber',
        'round.courseId',
        'course.name',
      ])
      .getMany();

    return rounds.map((round) => {
      const nameObj = parseJson<Record<string, string>>(round.course?.name);
      return {
        id: round.id,
        name: `Round ${round.roundNumber}`,
        courseName: nameObj[lang] ?? nameObj['en'] ?? round.course?.name ?? null,
        courseId: round.courseId,
      };
    });
  }

  async getCourseCategoriesMenu(lang: string): Promise<CourseCategoryMenuResponse[]> {
    const categories = await this.courseCategoryRepository.find({
      order: { id: 'DESC' },
    });

    return categories.map((category) => {
      const nameObj = parseJson<Record<string, string>>(category.name);
      return {
        id: category.id,
        name: nameObj[lang] ?? nameObj['en'] ?? (category.name as unknown as string),
      };
    });
  }
}
