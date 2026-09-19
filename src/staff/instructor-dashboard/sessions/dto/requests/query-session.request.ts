import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, IsString } from 'class-validator';

export class QuerySessionRequest {
  @ApiPropertyOptional({ description: 'Filter by round ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  roundId?: number;

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
