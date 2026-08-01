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

    static fromEntity(entity: CourseEntity, localizedLevel: string): CourseResponse {
        const response = new CourseResponse();
        response.id = entity.id;
        response.trainerId = entity.trainerId;
        response.categoryId = entity.categoryId;
        response.name = entity.name;
        response.description = entity.description;
        response.requirements = entity.requirements;
        response.benefits = entity.benefits;
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
                userId: entity.trainer.userId,
                numExperience: entity.trainer.numExperience,
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
