import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationRequest } from '../../../../common/dto/requests/pagination.request';

export class FilterStudentRequest extends PaginationRequest {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  assignToId?: number;

  @ApiPropertyOptional({
    description: 'Filter by creation date from (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date to (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  to?: string;
}
