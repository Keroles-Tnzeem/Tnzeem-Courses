import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { InquiryStatusEnum } from '../../../../../shared/inquiries/enums/inquiry-status.enum';

export class QueryInquiryRequest {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 15, description: 'Items per page' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: '512345678', description: 'Filter by phone' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by course ID' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsOptional()
  courseId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by student ID' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsOptional()
  studentId?: number;

  @ApiPropertyOptional({ enum: InquiryStatusEnum, description: 'Filter by status' })
  @IsEnum(InquiryStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  @IsOptional()
  status?: InquiryStatusEnum;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date filter' })
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31', description: 'End date filter' })
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  @IsOptional()
  endDate?: string;
}
