import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
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

export class CreateSessionRequest {
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

  @ApiPropertyOptional({ example: '2026-11-15T18:00:00Z', description: 'Scheduled start date and time (ISO 8601)' })
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE') })
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: '2026-11-15T19:30:00Z', description: 'Scheduled end date and time (ISO 8601); computed from scheduledAt + durationMinutes if omitted' })
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE') })
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ example: 'https://teams.microsoft.com/l/meetup-join/...', description: 'Meeting join link (auto-generated via Microsoft Teams when createTeamsMeeting is enabled)' })
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

  @ApiPropertyOptional({
    example: 'Asia/Riyadh',
    description: 'IANA timezone identifier for the scheduled session',
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to provision a Microsoft Teams meeting (defaults to true when TEAMS_ENABLED=true and scheduledAt is provided)',
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  @IsOptional()
  createTeamsMeeting?: boolean;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Whether to invite the course trainer and enrolled students to the Teams calendar event',
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  @IsOptional()
  inviteAttendees?: boolean;
}
