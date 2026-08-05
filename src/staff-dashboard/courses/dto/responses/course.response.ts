import { CourseStatusEnum } from '../../enums/course-status.enum';
import { CourseEntity } from '../../entities/course.entity';

export class CourseResponse {
    id: number;
    trainerId: number;
    categoryId: number;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    requirements?: string;
    benefits?: string;
    slug: string;
    image?: string;
    introVideo?: string;
    sessionsCount: number;
    durationHours: number;
    price: number;
    status: CourseStatusEnum;
    level: string;
    createdAt: Date;
    updatedAt: Date;

    trainer?: any;
    category?: any;

    static fromEntity(entity: CourseEntity, localizedLevel: string, lang = 'en'): CourseResponse {
        const response = new CourseResponse();
        response.id = entity.id;
        response.trainerId = entity.trainerId;
        response.categoryId = entity.categoryId;
        response.name = entity.name?.[lang] ?? entity.name?.['en'];
        response.description = entity.description?.[lang] ?? entity.description?.['en'];
        response.requirements = entity.requirements?.[lang] ?? entity.requirements?.['en'];
        response.benefits = entity.benefits?.[lang] ?? entity.benefits?.['en'];
        response.slug = entity.slug;
        response.image = entity.image;
        response.introVideo = entity.introVideo;
        response.sessionsCount = entity.sessionsCount;
        response.durationHours = entity.durationHours;
        response.price = Number(entity.price);
        response.status = entity.status;
        response.level = localizedLevel;
        response.createdAt = entity.audit?.createdAt;
        response.updatedAt = entity.audit?.updatedAt;

        if (entity.trainer) {
            // Include trainer response mapping if needed, simplified for now
            response.trainer = {
                id: entity.trainer.id,
                firstName: entity.trainer.firstName,
                lastName: entity.trainer.lastName,
                // Add more trainer details as required
            };
        }

        if (entity.category) {
            // Include category response mapping if needed, simplified for now
            response.category = {
                id: entity.category.id,
                name: entity.category.name,
            };
        }

        return response;
    }
}
