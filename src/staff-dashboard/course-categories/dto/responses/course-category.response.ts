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
        
        const parseJson = (val: any) => {
            if (typeof val === 'string') {
                try { return JSON.parse(val); } catch { return {}; }
            }
            return val || {};
        };
        
        const nameObj = parseJson(entity.name);
        const descObj = parseJson(entity.description);

        response.name = nameObj[lang] ?? nameObj['en'] ?? entity.name;
        response.description = descObj[lang] ?? descObj['en'] ?? entity.description;
        response.image = entity.image;
        response.courses_num = entity.coursesNum;
        return response;
    }
}
