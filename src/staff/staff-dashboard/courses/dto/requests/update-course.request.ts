import { i18nValidationMessage } from 'nestjs-i18n';
import { PartialType } from '@nestjs/swagger';
import { CreateCourseRequest } from './create-course.request';
import { CourseStatusEnum } from '../../enums/course-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateCourseRequest extends PartialType(CreateCourseRequest) {
    @ApiPropertyOptional({ enum: CourseStatusEnum })
    @IsOptional()
    @IsEnum(CourseStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    status?: CourseStatusEnum;
}
