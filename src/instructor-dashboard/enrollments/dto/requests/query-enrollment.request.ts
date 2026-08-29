import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EnrollmentStatusEnum } from '../../../../shared/enrollments/enums/enrollment-status.enum';

export class QueryEnrollmentRequest {
  @ApiPropertyOptional({ description: 'Filter by student ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  studentId?: number;

  @ApiPropertyOptional({ description: 'Filter by round ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roundId?: number;

  @ApiPropertyOptional({ enum: EnrollmentStatusEnum, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(EnrollmentStatusEnum)
  status?: EnrollmentStatusEnum;

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

  @ApiPropertyOptional({ description: 'Search term for student name' })
  @IsOptional()
  @IsString()
  search?: string;
}
