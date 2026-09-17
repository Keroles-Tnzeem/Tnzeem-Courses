import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, IsString } from 'class-validator';

export class QuerySessionRequest {
  @ApiPropertyOptional({ description: 'Filter by round ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roundId?: number;

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

  @ApiPropertyOptional({ enum: ['session_number', 'scheduled_at', 'created_at'], default: 'session_number' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'session_number';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
