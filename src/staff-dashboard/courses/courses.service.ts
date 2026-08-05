import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from './entities/course.entity';
import { CreateCourseRequest } from './dto/requests/create-course.request';
import { UpdateCourseRequest } from './dto/requests/update-course.request';
import { QueryCourseRequest } from './dto/requests/query-course.request';
import { TrainerInfoEntity } from '../../shared/user/entities/trainer-info.entity';
import { CourseCategoryEntity } from '../course-categories/entities/course-category.entity';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';
import { CourseResponse } from './dto/responses/course.response';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { courseLevelTranslationKey } from '../../shared/enums/course-level.enum';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(CourseEntity)
        private readonly courseRepo: Repository<CourseEntity>,
        @InjectRepository(TrainerInfoEntity)
        private readonly trainerRepo: Repository<TrainerInfoEntity>,
        @InjectRepository(CourseCategoryEntity)
        private readonly categoryRepo: Repository<CourseCategoryEntity>,
        private readonly i18n: I18nService
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    private toResponse(course: CourseEntity): CourseResponse {
        const level = this.i18n.t(courseLevelTranslationKey(course.level), {
            lang: this.lang(),
        }) as string;
        return CourseResponse.fromEntity(course, level);
    }

    async create(dto: CreateCourseRequest, image?: string, introVideo?: string): Promise<CourseResponse> {
        // Verify Trainer
        const trainer = await this.trainerRepo.findOne({
            where: { userId: dto.trainerId },
            relations: { user: true }
        });
        if (!trainer) {
            throw new NotFoundException(this.i18n.t('errors.TRAINER_NOT_FOUND', { lang: I18nContext.current()?.lang }) || 'Trainer not found');
        }
        if (trainer.user?.userType !== UserTypeEnum.TRAINER) {
            throw new BadRequestException('Assigned user is not a trainer');
        }

        // Verify Category
        const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
        if (!category) {
            throw new NotFoundException(this.i18n.t('errors.CATEGORY_NOT_FOUND', { lang: I18nContext.current()?.lang }) || 'Category not found');
        }

        // Verify Slug Uniqueness
        const existingCourse = await this.courseRepo.findOne({ where: { slug: dto.slug } });
        if (existingCourse) {
            throw new ConflictException(this.i18n.t('errors.SLUG_TAKEN', { lang: I18nContext.current()?.lang }) || 'Course with this slug already exists');
        }

        const courseData: any = { ...dto, image, introVideo };
        courseData.trainerId = trainer.id; // Use TrainerInfoEntity ID for the foreign key

        const course = this.courseRepo.create(courseData as Partial<CourseEntity>);
        const savedCourse = await this.courseRepo.save(course);
        return this.toResponse(savedCourse);
    }

    async findAll(query: QueryCourseRequest): Promise<PaginationResponse<CourseResponse>> {
        const { page = 1, limit = 10, keyword, trainerId, categoryId, status, sortBy = 'createdAt', order = 'DESC' } = query;
        
        const qb = this.courseRepo.createQueryBuilder('course')
            .leftJoinAndSelect('course.trainer', 'trainer')
            .leftJoinAndSelect('course.category', 'category');

        if (keyword) {
            qb.andWhere(
                '(course.name->>\'ar\' ILIKE :keyword OR course.name->>\'en\' ILIKE :keyword)',
                { keyword: `%${keyword}%` }
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
        const orderColumn = sortBy === 'price' ? 'course.price' : 'course.audit.createdAt';
        qb.orderBy(orderColumn, order);

        const [entities, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const data = entities.map(entity => this.toResponse(entity));
        
        return PaginationResponse.success(data, total, page, limit);
    }

    async findOne(id: number): Promise<CourseResponse> {
        const course = await this.courseRepo.findOne({
            where: { id },
            relations: { trainer: true, category: true }
        });

        if (!course) {
            throw new NotFoundException(this.i18n.t('errors.COURSE_NOT_FOUND', { lang: I18nContext.current()?.lang }) || 'Course not found');
        }

        return this.toResponse(course);
    }

    async update(id: number, dto: UpdateCourseRequest, image?: string, introVideo?: string): Promise<CourseResponse> {
        const course = await this.courseRepo.findOne({ where: { id } });
        if (!course) {
            throw new NotFoundException(this.i18n.t('errors.COURSE_NOT_FOUND', { lang: I18nContext.current()?.lang }) || 'Course not found');
        }

        if (dto.trainerId) {
            const trainer = await this.trainerRepo.findOne({
                where: { userId: dto.trainerId },
                relations: { user: true }
            });
            if (!trainer) {
                throw new NotFoundException(this.i18n.t('errors.TRAINER_NOT_FOUND', { lang: I18nContext.current()?.lang }) || 'Trainer not found');
            }
            if (trainer.user?.userType !== UserTypeEnum.TRAINER) {
                throw new BadRequestException('Assigned user is not a trainer');
            }
        }

        if (dto.categoryId) {
            const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
            if (!category) {
                throw new NotFoundException(this.i18n.t('errors.CATEGORY_NOT_FOUND', { lang: I18nContext.current()?.lang }) || 'Category not found');
            }
        }

        if (dto.slug && dto.slug !== course.slug) {
            const existingCourse = await this.courseRepo.findOne({ where: { slug: dto.slug } });
            if (existingCourse) {
                throw new ConflictException(this.i18n.t('errors.SLUG_TAKEN', { lang: I18nContext.current()?.lang }) || 'Course with this slug already exists');
            }
        }

        const courseData: any = { ...dto };
        if (dto.trainerId) {
            // we already validated trainer above
            const trainer = await this.trainerRepo.findOne({ where: { userId: dto.trainerId } });
            if (trainer) courseData.trainerId = trainer.id;
        }
        if (image !== undefined) courseData.image = image;
        if (introVideo !== undefined) courseData.introVideo = introVideo;

        Object.assign(course, courseData);
        const updatedCourse = await this.courseRepo.save(course);
        return this.toResponse(updatedCourse);
    }

    async remove(id: number): Promise<void> {
        const course = await this.courseRepo.findOne({ where: { id } });
        if (!course) {
            throw new NotFoundException(this.i18n.t('errors.COURSE_NOT_FOUND', { lang: I18nContext.current()?.lang }) || 'Course not found');
        }
        await this.courseRepo.softDelete(id);
    }
}
