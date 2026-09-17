import { PartialType } from '@nestjs/swagger';
import { CreateCourseRequest } from './create-course.request';

export class UpdateCourseRequest extends PartialType(CreateCourseRequest) {}
