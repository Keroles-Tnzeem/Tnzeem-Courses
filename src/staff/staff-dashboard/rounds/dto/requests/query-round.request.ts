import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RoundStatusEnum } from '../../enums/round-status.enum';

export class QueryRoundRequest {
    @ApiPropertyOptional({ default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Filter by course ID' })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    courseId?: number;

    @ApiPropertyOptional({ enum: RoundStatusEnum, description: 'Filter by status' })
    @IsEnum(RoundStatusEnum)
    @IsOptional()
    status?: RoundStatusEnum;

    @ApiPropertyOptional({ enum: ['round_number', 'start_date', 'created_at'], default: 'round_number' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'round_number';

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
