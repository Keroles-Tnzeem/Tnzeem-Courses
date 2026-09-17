import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryRoundSessionRequest {
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

    @ApiPropertyOptional({ description: 'Filter by round ID' })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    roundId?: number;

    @ApiPropertyOptional({ enum: ['session_number', 'scheduled_at', 'created_at'], default: 'session_number' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'session_number';

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
