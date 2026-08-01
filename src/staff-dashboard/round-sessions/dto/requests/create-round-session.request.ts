import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateRoundSessionRequest {
    @ApiProperty({ example: 1, description: 'Round ID this session belongs to' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    roundId: number;

    @ApiProperty({ example: 1, description: 'Session number within the round (e.g. 1 of 8)' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    sessionNumber: number;

    @ApiPropertyOptional({ example: 'Introduction to Variables' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @MaxLength(255, { message: i18nValidationMessage('validation.MAX_LENGTH') })
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ example: '2025-01-20T18:00:00Z', description: 'Scheduled date and time (ISO 8601)' })
    @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE') })
    @IsOptional()
    scheduledAt?: string;

    @ApiPropertyOptional({ example: 'https://zoom.us/j/123456789', description: 'Zoom meeting link' })
    @IsUrl({}, { message: i18nValidationMessage('validation.IS_URL') })
    @IsOptional()
    zoomLink?: string;

    @ApiPropertyOptional({ example: 90, description: 'Session duration in minutes' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    durationMinutes?: number;

    @ApiPropertyOptional({ example: 'Bring your laptop' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    notes?: string;
}
