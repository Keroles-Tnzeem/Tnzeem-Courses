import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { EnrollmentStatusEnum } from '../../../../../shared/enrollments/enums/enrollment-status.enum';

export class QueryStudentEnrollmentRequest {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    enum: EnrollmentStatusEnum,
    description: 'Filter by enrollment status',
  })
  @IsOptional()
  @IsEnum(EnrollmentStatusEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  status?: EnrollmentStatusEnum;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], example: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: i18nValidationMessage('validation.IS_ENUM') })
  sortOrder?: 'ASC' | 'DESC';
}
