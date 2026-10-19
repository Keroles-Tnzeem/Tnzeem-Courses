import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { RoundStatusEnum } from '../../../../staff-dashboard/rounds/enums/round-status.enum';

export class QueryRoundRequest {
  @ApiPropertyOptional({ description: 'Filter by course ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  courseId?: number;

  @ApiPropertyOptional({ enum: RoundStatusEnum, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(RoundStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  status?: RoundStatusEnum;

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
}
