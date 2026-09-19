import { i18nValidationMessage } from 'nestjs-i18n';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevelEnum } from '../../../../../common/enums/course-level.enum';

class MultiLingualPropertyDto {
  @ApiProperty({ example: 'دورة نود جي إس' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  ar: string;

  @ApiProperty({ example: 'Node.js Course' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  en: string;
}

export class CreateCourseRequest {
  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Type(() => Number)
  trainerId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Type(() => Number)
  categoryId: number;

  @ApiProperty({ type: MultiLingualPropertyDto })
  @ValidateNested()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  })
  @Type(() => MultiLingualPropertyDto)
  name: MultiLingualPropertyDto;

  @ApiProperty({ type: MultiLingualPropertyDto })
  @ValidateNested()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  })
  @Type(() => MultiLingualPropertyDto)
  description: MultiLingualPropertyDto;

  @ApiPropertyOptional({ type: MultiLingualPropertyDto })
  @ValidateNested()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  })
  @Type(() => MultiLingualPropertyDto)
  @IsOptional()
  requirements?: MultiLingualPropertyDto;

  @ApiPropertyOptional({ type: MultiLingualPropertyDto })
  @ValidateNested()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  })
  @Type(() => MultiLingualPropertyDto)
  @IsOptional()
  benefits?: MultiLingualPropertyDto;

  @ApiProperty({ example: 'node-js-course' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: i18nValidationMessage('validation.INVALID_SLUG'),
  })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  slug: string;

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

  @ApiProperty({ example: 10 })
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @Type(() => Number)
  sessionsCount: number;

  @ApiProperty({ example: 20 })
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @Type(() => Number)
  durationHours: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    enum: Object.values(CourseLevelEnum),
    enumName: 'CourseLevel',
    description: 'Course difficulty level',
    example: CourseLevelEnum.BEGINNER,
  })
  @IsEnum(CourseLevelEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  level: CourseLevelEnum;
}
