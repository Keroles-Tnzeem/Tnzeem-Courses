import { CourseCategoryEntity } from '../../entities/course-category.entity';

export class CourseCategoryResponse {
    id: number;
    name: string;
    description: string;
    image: string;
    courses_num: number;

    static from(entity: CourseCategoryEntity, lang = 'en'): CourseCategoryResponse {
        const response = new CourseCategoryResponse();
        response.id = entity.id;
        response.name = entity.name?.[lang] ?? entity.name?.['en'];
        response.description = entity.description?.[lang] ?? entity.description?.['en'];
        response.image = entity.image;
        response.courses_num = entity.coursesNum;
        return response;
    }
}
