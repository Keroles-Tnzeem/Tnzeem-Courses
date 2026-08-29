import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from './entities/course.entity';
import { CreateCourseRequest } from './dto/requests/create-course.request';
import { UpdateCourseRequest } from './dto/requests/update-course.request';
import { QueryCourseRequest } from './dto/requests/query-course.request';
import { CourseCategoryEntity } from '../course-categories/entities/course-category.entity';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';
import { CourseResponse } from './dto/responses/course.response';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { courseLevelTranslationKey } from '../../common/enums/course-level.enum';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';
import { UserEntity } from 'src/shared/user/entities/user.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly trainerRepo: Repository<UserEntity>,
    @InjectRepository(CourseCategoryEntity)
    private readonly categoryRepo: Repository<CourseCategoryEntity>,
    private readonly i18n: I18nService,
  ) {}

  private toResponse(course: CourseEntity, lang: string): CourseResponse {
    const level = this.i18n.t(courseLevelTranslationKey(course.level), {
      lang,
    }) as string;
    return CourseResponse.fromEntity(course, level, lang);
  }

  async create(
    dto: CreateCourseRequest,
    lang: string,
    image?: string,
    introVideo?: string,
  ): Promise<CourseResponse> {
    // Verify Trainer
    const trainer = await this.trainerRepo.findOne({
      where: { id: dto.trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(
        this.i18n.t('errors.TRAINER_NOT_FOUND', { lang }) ||
          'Trainer not found',
      );
    }
    if (trainer.userType !== UserTypeEnum.TRAINER) {
      throw new BadRequestException('Assigned user is not a trainer');
    }

    // Verify Category
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        this.i18n.t('errors.CATEGORY_NOT_FOUND', { lang }) ||
          'Category not found',
      );
    }

    // Verify Slug Uniqueness
    const existingCourse = await this.courseRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existingCourse) {
      throw new ConflictException(
        this.i18n.t('errors.SLUG_TAKEN', { lang }) ||
          'Course with this slug already exists',
      );
    }

    const courseData: any = { ...dto, image, introVideo };
    courseData.trainerId = trainer.id; // Use UserEntity ID for the foreign key

    const course = this.courseRepo.create(courseData as Partial<CourseEntity>);
    const saved = await this.courseRepo.save(course);
    return this.toResponse(saved, lang);
  }

  async findAll(
    query: QueryCourseRequest,
    lang: string,
  ): Promise<PaginationResponse<CourseResponse>> {
    const {
      page = 1,
      limit = 10,
      keyword,
      trainerId,
      categoryId,
      status,
      sortBy = 'createdAt',
      order = 'DESC',
    } = query;

    const qb = this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.trainer', 'trainer')
      .leftJoinAndSelect('course.category', 'category');

    if (keyword) {
      qb.andWhere(
        "(course.name->>'ar' ILIKE :keyword OR course.name->>'en' ILIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    if (trainerId) {
      qb.andWhere('course.trainer_id = :trainerId', { trainerId });
    }

    if (categoryId) {
      qb.andWhere('course.category_id = :categoryId', { categoryId });
    }

    if (status) {
      qb.andWhere('course.status = :status', { status });
    }

    // Order mapping
    const orderColumn =
      sortBy === 'price' ? 'course.price' : 'course.audit.createdAt';
    qb.orderBy(orderColumn, order);

    const [entities, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((e) => this.toResponse(e, lang));

    return PaginationResponse.success(data, total, page, limit);
  }

  async findOne(id: number, lang: string): Promise<CourseResponse> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['trainer', 'category'],
    });

    if (!course) {
      throw new NotFoundException(
        this.i18n.t('errors.COURSE_NOT_FOUND', { lang }) || 'Course not found',
      );
    }

    return this.toResponse(course, lang);
  }

  async update(
    id: number,
    dto: UpdateCourseRequest,
    lang: string,
    image?: string,
    introVideo?: string,
  ): Promise<CourseResponse> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['trainer', 'category'],
    });

    if (!course) {
      throw new NotFoundException(
        this.i18n.t('errors.COURSE_NOT_FOUND', { lang }) || 'Course not found',
      );
    }

    if (dto.trainerId && dto.trainerId !== course.trainerId) {
      const trainer = await this.trainerRepo.findOne({
        where: { id: dto.trainerId },
      });
      if (!trainer) {
        throw new NotFoundException(
          this.i18n.t('errors.TRAINER_NOT_FOUND', { lang }) ||
            'Trainer not found',
        );
      }
      if (trainer.userType !== UserTypeEnum.TRAINER) {
        throw new BadRequestException('Assigned user is not a trainer');
      }
    }

    if (dto.categoryId && dto.categoryId !== course.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          this.i18n.t('errors.CATEGORY_NOT_FOUND', { lang }) ||
            'Category not found',
        );
      }
    }

    if (dto.slug && dto.slug !== course.slug) {
      const existingCourse = await this.courseRepo.findOne({
        where: { slug: dto.slug },
      });
      if (existingCourse) {
        throw new ConflictException(
          this.i18n.t('errors.SLUG_TAKEN', { lang }) ||
            'Course with this slug already exists',
        );
      }
    }

    const courseData: any = { ...dto };
    if (dto.trainerId) {
      const trainer = await this.trainerRepo.findOne({
        where: { id: dto.trainerId },
      });
      if (trainer) {
        courseData.trainerId = trainer.id;
        course.trainer = trainer;
      }
    }
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (category) {
        courseData.categoryId = category.id;
        course.category = category;
      }
    }
    if (image !== undefined) courseData.image = image;
    if (introVideo !== undefined) courseData.introVideo = introVideo;

    Object.assign(course, courseData);
    const updated = await this.courseRepo.save(course);
    return this.toResponse(updated, lang);
  }

  async remove(id: number, lang: string): Promise<void> {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(
        this.i18n.t('errors.COURSE_NOT_FOUND', { lang }) || 'Course not found',
      );
    }
    await this.courseRepo.softDelete(id);
  }
}
