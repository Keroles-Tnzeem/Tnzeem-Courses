import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { RoundStatusEnum } from '../../../../staff-dashboard/rounds/enums/round-status.enum';

export class QueryRoundRequest {
  @ApiPropertyOptional({ description: 'Filter by course ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional({ enum: RoundStatusEnum, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(RoundStatusEnum)
  status?: RoundStatusEnum;

  @ApiPropertyOptional({ default: 10, description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ default: 0, description: 'Offset for pagination' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
