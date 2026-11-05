import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { MeetingStatusEnum } from '../../../../../shared/meetings/enums/meeting-status.enum';
import { MeetingSyncStatusEnum } from '../../../../../shared/meetings/enums/meeting-sync-status.enum';

export class QueryRoundSessionRequest {
    @ApiPropertyOptional({ default: 1 })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Filter by round ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @IsOptional()
    roundId?: number;

    @ApiPropertyOptional({ description: 'Filter by course ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @IsOptional()
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

    @ApiPropertyOptional({ enum: ['session_number', 'scheduled_at', 'created_at'], default: 'session_number' })
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    sortBy?: string = 'session_number';

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
