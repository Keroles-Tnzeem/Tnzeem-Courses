import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, QueryFailedError } from 'typeorm';
import { CourseCategoryEntity } from './entities/course-category.entity';
import { CreateCourseCategoryRequest } from './dto/requests/create-course-category.request';
import { UpdateCourseCategoryRequest } from './dto/requests/update-course-category.request';
import { QueryCourseCategoryRequest } from './dto/requests/query-course-category.request';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { StorageService } from '../../shared/storage/storage.service';
import { UploadType } from '../../shared/storage/enums/upload-type.enum';
import { getLang } from 'src/common/helpers/lang.helper';

@Injectable()
export class CourseCategoriesService {
    constructor(
        @InjectRepository(CourseCategoryEntity)
        private readonly courseCategoryRepository: Repository<CourseCategoryEntity>,
        private readonly i18n: I18nService,
        private readonly storageService: StorageService,
    ) {}

   

    /** Multipart sends nested objects as JSON strings — parse them safely */
    private parseJsonField<T>(value: T | string | undefined): T | undefined {
        if (typeof value === 'string') {
            try { return JSON.parse(value) as T; } catch { return undefined; }
        }
        return value as T | undefined;
    }

    async create(dto: CreateCourseCategoryRequest, imageFile?: any): Promise<CourseCategoryEntity> {
        let imageUrl = dto.image;
        if (imageFile) {
            const uploadRes = await this.storageService.upload(imageFile, UploadType.IMAGE);
            imageUrl = uploadRes.url;
        }

        const entity = this.courseCategoryRepository.create({
            name: this.parseJsonField(dto.name) ?? dto.name,
            description: this.parseJsonField(dto.description) ?? dto.description,
            image: imageUrl,
            coursesNum: 0,
        });

        return await this.courseCategoryRepository.save(entity);
    }

    async findAll(query: QueryCourseCategoryRequest): Promise<{ data: CourseCategoryEntity[]; total: number }> {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.name = ILike(`%${search}%`); // This might need refinement for JSON searches depending on DB
        }

        const [data, total] = await this.courseCategoryRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: { id: 'DESC' },
        });

        return { data, total };
    }

    async findOne(id: number): Promise<CourseCategoryEntity> {
        const entity = await this.courseCategoryRepository.findOne({ where: { id } });
        if (!entity) {
            throw new NotFoundException(this.i18n.t('errors.NOT_FOUND', { lang: getLang() }));
        }
        return entity;
    }

    async update(id: number, dto: UpdateCourseCategoryRequest, imageFile?: any): Promise<CourseCategoryEntity> {
        const entity = await this.findOne(id);

        const parsedName = this.parseJsonField(dto.name);
        const parsedDescription = this.parseJsonField(dto.description);

        if (parsedName) entity.name = parsedName;
        if (parsedDescription) entity.description = parsedDescription;

        let imageUrl: string | undefined;
        if (imageFile) {
            const uploadRes = await this.storageService.upload(imageFile, UploadType.IMAGE);
            imageUrl = uploadRes.url;
            entity.image = imageUrl;
        }
        // If no imageFile and no dto.image, keep the existing image untouched

        return await this.courseCategoryRepository.save(entity);
    }

    async remove(id: number): Promise<void> {
        const entity = await this.findOne(id);
        try {
            await this.courseCategoryRepository.remove(entity);
        } catch (error) {
            if (error instanceof QueryFailedError && (error as any).code === '23503') {
                throw new ConflictException(
                    this.i18n.t('errors.CANNOT_DELETE_HAS_RELATIONS', {
                        lang: getLang(),
                    }),
                );    
            }
            throw error;
        }
    }
}
