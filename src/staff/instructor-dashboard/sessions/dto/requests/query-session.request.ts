import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MeetingStatusEnum } from '../../../../../shared/meetings/enums/meeting-status.enum';
import { MeetingSyncStatusEnum } from '../../../../../shared/meetings/enums/meeting-sync-status.enum';

export class QuerySessionRequest {
  @ApiPropertyOptional({ description: 'Filter by round ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  roundId?: number;

  @ApiPropertyOptional({ description: 'Filter by course ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  courseId?: number;

  @ApiPropertyOptional({ enum: MeetingStatusEnum, description: 'Filter by session meeting status' })
  @IsEnum(MeetingStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  @IsOptional()
  meetingStatus?: MeetingStatusEnum;

  @ApiPropertyOptional({ enum: MeetingSyncStatusEnum, description: 'Filter by Microsoft Teams sync status' })
  @IsEnum(MeetingSyncStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  @IsOptional()
  syncStatus?: MeetingSyncStatusEnum;

  @ApiPropertyOptional({ description: 'When true, only return non-cancelled upcoming/live sessions' })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  @IsOptional()
  upcomingOnly?: boolean;

  @ApiPropertyOptional({ default: 1, description: 'Page number (1-based); takes precedence over offset' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  page?: number;

  @ApiPropertyOptional({ default: 10, description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  limit?: number = 10;

  @ApiPropertyOptional({ default: 0, description: 'Offset for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  offset?: number = 0;

  @ApiPropertyOptional({ enum: ['session_number', 'scheduled_at', 'created_at'], default: 'session_number' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  sortBy?: string = 'session_number';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
