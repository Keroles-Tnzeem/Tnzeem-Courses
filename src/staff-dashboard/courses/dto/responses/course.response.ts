import { CourseStatusEnum } from '../../enums/course-status.enum';
import { CourseEntity } from '../../entities/course.entity';
import {parseJson} from "../../../../common/helpers/parse-json.helper";

export class CourseResponse {
    id: number;
    trainerId: number;
    categoryId: number;
    name: string;
    description: string;
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
    createdAt: Date | undefined;
    updatedAt: Date | undefined;

    trainer?: any;
    category?: any;

    static fromEntity(entity: CourseEntity, localizedLevel: string, lang = 'en'): CourseResponse {
        const response = new CourseResponse();
        response.id = entity.id;
        response.trainerId = entity.trainerId;
        response.categoryId = entity.categoryId;


        const nameObj = parseJson<Record<string, string>>(entity.name);
        const descObj = parseJson<Record<string, string>>(entity.description);
        const reqObj = parseJson<Record<string, string>>(entity.requirements);
        const benObj = parseJson<Record<string, string>>(entity.benefits);

        response.name = nameObj[lang] ?? nameObj['en'] ?? entity.name;
        response.description = descObj[lang] ?? descObj['en'] ?? entity.description;
        response.requirements = reqObj[lang] ?? reqObj['en'] ?? entity.requirements;
        response.benefits = benObj[lang] ?? benObj['en'] ?? entity.benefits;
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
            response.trainer = {
                id: entity.trainer.id,
                firstName: entity.trainer.firstName,
                lastName: entity.trainer.lastName,
            };
        }

        if (entity.category) {
            response.category = {
                id: entity.category.id,
                name: entity.category.name?.[lang] ?? entity.category.name?.['en'],
            };
        }

        return response;
    }
}
