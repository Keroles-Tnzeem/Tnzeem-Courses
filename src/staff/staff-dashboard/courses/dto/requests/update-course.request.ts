import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CourseLevelEnum } from '../../../../../common/enums/course-level.enum';
import { CourseStatusEnum } from '../../enums/course-status.enum';

/**
 * Partial bilingual DTO — both language keys are optional.
 * The client sends only the language it wants to update, e.g. name[ar]=value.
 * The service spreads the provided keys into the stored { ar, en } JSONB object.
 */
export class PartialMultiLingualDto {
  @ApiPropertyOptional({ example: 'دورة نود جي إس' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  ar?: string;

  @ApiPropertyOptional({ example: 'Node.js Course' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  en?: string;
}

/**
 * All fields are optional for PATCH.
 *
 * For translatable fields (name, description, requirements, benefits):
 *   - Send name[ar]=value  → only Arabic is updated, English preserved.
 *   - Send name[en]=value  → only English is updated, Arabic preserved.
 *   - Send both            → both are updated.
 */
export class UpdateCourseRequest {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Type(() => Number)
  trainerId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ type: PartialMultiLingualDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialMultiLingualDto)
  name?: PartialMultiLingualDto;

  @ApiPropertyOptional({ type: PartialMultiLingualDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialMultiLingualDto)
  description?: PartialMultiLingualDto;

  @ApiPropertyOptional({ type: PartialMultiLingualDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialMultiLingualDto)
  requirements?: PartialMultiLingualDto;

  @ApiPropertyOptional({ type: PartialMultiLingualDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialMultiLingualDto)
  benefits?: PartialMultiLingualDto;

  @ApiPropertyOptional({ example: 'node-js-course' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: i18nValidationMessage('validation.INVALID_SLUG'),
  })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  slug?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Course thumbnail image',
  })
  image?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Course introduction video',
  })
  introVideo?: any;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @Type(() => Number)
  sessionsCount?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @Type(() => Number)
  durationHours?: number;

  @ApiPropertyOptional({ example: 99.99 })
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    enum: Object.values(CourseLevelEnum),
    enumName: 'CourseLevel',
    description: 'Course difficulty level',
    example: CourseLevelEnum.BEGINNER,
  })
  @IsOptional()
  @IsEnum(CourseLevelEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  level?: CourseLevelEnum;

  @ApiPropertyOptional({ enum: CourseStatusEnum })
  @IsOptional()
  @IsEnum(CourseStatusEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  status?: CourseStatusEnum;
}
