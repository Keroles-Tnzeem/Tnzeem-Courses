import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseEntity } from '../../../../../staff-dashboard/courses/entities/course.entity';
import { CourseLevelEnum } from '../../../../../common/enums/course-level.enum';
import { CourseStatusEnum } from '../../../../../staff-dashboard/courses/enums/course-status.enum';

export class GuestCourseResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    trainerId: number;

    @ApiProperty()
    categoryId: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiPropertyOptional()
    requirements?: string;

    @ApiPropertyOptional()
    benefits?: string;

    @ApiPropertyOptional()
    slug?: string;

    @ApiPropertyOptional()
    image?: string;

    @ApiPropertyOptional()
    introVideo?: string;

    @ApiProperty()
    sessionsCount: number;

    @ApiProperty()
    durationHours: number;

    @ApiProperty()
    price: number;

    @ApiProperty({ enum: CourseStatusEnum })
    status: CourseStatusEnum;

    @ApiProperty({ enum: CourseLevelEnum })
    level: CourseLevelEnum;

    @ApiPropertyOptional()
    trainer?: any;

    @ApiPropertyOptional()
    category?: any;

    static from(entity: CourseEntity, lang: string = 'en'): GuestCourseResponse {
        const response = new GuestCourseResponse();

        const parseJson = (val: any) => {
            if (typeof val === 'string') {
                try { return JSON.parse(val); } catch { return {}; }
            }
            return val || {};
        };

        const nameObj = parseJson(entity.name);
        const descObj = parseJson(entity.description);
        const reqObj = parseJson(entity.requirements);
        const benObj = parseJson(entity.benefits);

        response.id = entity.id;
        response.trainerId = entity.trainerId;
        response.categoryId = entity.categoryId;
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
        response.level = entity.level;

        if (entity.trainer) {
            response.trainer = {
                id: entity.trainer.id,
                firstName: entity.trainer.firstName,
                lastName: entity.trainer.lastName,
                image: entity.trainer.img,
            };
        }

        if (entity.category) {
            const catNameObj = parseJson(entity.category.name);
            response.category = {
                id: entity.category.id,
                name: catNameObj[lang] ?? catNameObj['en'] ?? entity.category.name,
            };
        }

        return response;
    }
}
