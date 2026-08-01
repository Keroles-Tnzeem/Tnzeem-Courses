import { PartialType } from '@nestjs/swagger';
import { CreateCourseRequest } from './create-course.request';
import { CourseStatusEnum } from '../../enums/course-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateCourseRequest extends PartialType(CreateCourseRequest) {
    @ApiPropertyOptional({ enum: CourseStatusEnum })
    @IsOptional()
    @IsEnum(CourseStatusEnum)
    status?: CourseStatusEnum;
}
