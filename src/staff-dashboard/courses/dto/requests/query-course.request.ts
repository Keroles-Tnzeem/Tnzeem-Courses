import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationRequest } from '../../../../common/dto/requests/pagination.request';
import { CourseStatusEnum } from '../../enums/course-status.enum';

export class QueryCourseRequest extends PaginationRequest {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    keyword?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    trainerId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    categoryId?: number;

    @ApiPropertyOptional({ enum: CourseStatusEnum })
    @IsOptional()
    @IsEnum(CourseStatusEnum)
    status?: CourseStatusEnum;

    @ApiPropertyOptional({ enum: ['createdAt', 'price'] })
    @IsOptional()
    @IsIn(['createdAt', 'price'])
    sortBy?: 'createdAt' | 'price' = 'createdAt';

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    order?: 'ASC' | 'DESC' = 'DESC';
}
