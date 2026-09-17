import { PartialType } from '@nestjs/swagger';
import { CreateCourseCategoryRequest } from './create-course-category.request';

export class UpdateCourseCategoryRequest extends PartialType(CreateCourseCategoryRequest) {}
