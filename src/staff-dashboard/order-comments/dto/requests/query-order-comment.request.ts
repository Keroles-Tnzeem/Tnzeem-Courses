import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationRequest } from '../../../../common/dto/requests/pagination.request';

export class QueryOrderCommentRequest extends PaginationRequest {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    orderId?: string;

    @ApiPropertyOptional({ enum: ['createdAt'] })
    @IsOptional()
    @IsIn(['createdAt'])
    sortBy?: 'createdAt' = 'createdAt';

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    order?: 'ASC' | 'DESC' = 'DESC';
}
