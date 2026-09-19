import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationRequest } from '../../../../../common/dto/requests/pagination.request';

export class FilterStudentRequest extends PaginationRequest {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsOptional()
  assignToId?: number;

  @ApiPropertyOptional({
    description: 'Filter by creation date from (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date to (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
  @IsOptional()
  to?: string;
}
