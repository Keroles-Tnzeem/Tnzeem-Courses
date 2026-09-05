import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../../staff-dashboard/courses/entities/course.entity';
import { CreateCourseRequest } from './dto/requests/create-course.request';
import { UpdateCourseRequest } from './dto/requests/update-course.request';
import { QueryCourseRequest } from './dto/requests/query-course.request';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';
import { CourseResponse } from './dto/responses/course.response';
import { I18nService } from 'nestjs-i18n';
import { courseLevelTranslationKey } from '../../common/enums/course-level.enum';
import { getLang } from '../../common/helpers/lang.helper';
import { CourseStatusEnum } from '../../staff-dashboard/courses/enums/course-status.enum';

@Injectable()
export class InstructorCoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    private readonly i18n: I18nService,
  ) {}

  private toResponse(course: CourseEntity): CourseResponse {
    const level = this.i18n.t(courseLevelTranslationKey(course.level), {
      lang: getLang(),
    }) as string;
    return CourseResponse.fromEntity(course, level, getLang());
  }

  async create(
    trainerId: number,
    dto: CreateCourseRequest,
    image?: string,
    introVideo?: string,
  ): Promise<CourseResponse> {
    // Verify Slug Uniqueness
    const existingCourse = await this.courseRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existingCourse) {
      throw new ConflictException(
        this.i18n.t('errors.SLUG_TAKEN', { lang: getLang() }) ||
          'Course with this slug already exists',
      );
    }

    const courseData: any = { ...dto, image, introVideo };
    courseData.trainerId = trainerId;
    courseData.status = CourseStatusEnum.PENDING; // Pending approval by staff

    const course = this.courseRepo.create(courseData as Partial<CourseEntity>);
    const savedCourse = await this.courseRepo.save(course);
    return this.toResponse(savedCourse);
  }

  async findOne(trainerId: number, id: number): Promise<CourseResponse> {
    const entity = await this.courseRepo.findOne({
      where: { id, trainerId },
      relations: { trainer: true, category: true },
    });
    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) ||
          'Course not found',
      );
    }
    return this.toResponse(entity);
  }

  async findAll(
    trainerId: number,
    query: QueryCourseRequest,
  ): Promise<PaginationResponse<CourseResponse>> {
    const { limit = 10, offset = 0, search } = query;

    const qb = this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.trainer', 'trainer')
      .leftJoinAndSelect('course.category', 'category')
      .where('course.trainer_id = :trainerId', { trainerId });

    if (search) {
      qb.andWhere(
        "(course.name->>'ar' ILIKE :search OR course.name->>'en' ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    qb.orderBy('course.audit.createdAt', 'DESC');

    const [entities, total] = await qb
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((entity) => this.toResponse(entity));

    // The PaginationResponse takes (data, total, page, limit)
    const page = Math.floor(offset / limit) + 1;
    return PaginationResponse.success(data, total, page, limit);
  }

  async update(
    trainerId: number,
    id: number,
    dto: UpdateCourseRequest,
    image?: string,
    introVideo?: string,
  ): Promise<CourseResponse> {
    const entity = await this.courseRepo.findOne({
      where: { id, trainerId },
      relations: { trainer: true, category: true },
    });

    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }) ||
          'Course not found',
      );
    }

    if (dto.slug && dto.slug !== entity.slug) {
      const duplicate = await this.courseRepo.findOne({
        where: { slug: dto.slug },
      });
      if (duplicate) {
        throw new ConflictException(
          this.i18n.t('errors.SLUG_TAKEN', { lang: getLang() }) ||
            'Slug already taken',
        );
      }
      entity.slug = dto.slug;
    }

    if (dto.categoryId !== undefined) entity.categoryId = dto.categoryId;
    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.description !== undefined) entity.description = dto.description;

    if (dto.requirements !== undefined) {
      entity.requirements = dto.requirements;
    }

    if (dto.benefits !== undefined) {
      entity.benefits = dto.benefits;
    }

    if (dto.sessionsCount !== undefined)
      entity.sessionsCount = dto.sessionsCount;
    if (dto.durationHours !== undefined)
      entity.durationHours = dto.durationHours;
    if (dto.price !== undefined) entity.price = dto.price;
    if (dto.level !== undefined) entity.level = dto.level;

    if (image !== undefined) entity.image = image;
    if (introVideo !== undefined) entity.introVideo = introVideo;

    // Reset status to PENDING if significant fields are updated, based on business rules
    // Here we'll just let them update it. If there's an approval workflow, you might set entity.status = CourseStatusEnum.PENDING;

    const saved = await this.courseRepo.save(entity);
    return this.toResponse(saved);
  }
}
