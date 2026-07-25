import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginationRequest {
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

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    search?: string;
}
