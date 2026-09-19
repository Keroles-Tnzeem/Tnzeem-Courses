import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OrderStatusEnum } from '../../enums/order-status.enum';

export class QueryOrderRequest {
    @ApiPropertyOptional({ example: 1 })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ example: 10 })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ example: 1, description: 'Filter by student ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    studentId?: number;

    @ApiPropertyOptional({ example: 1, description: 'Filter by round ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    roundId?: number;

    @ApiPropertyOptional({ example: 1, description: 'Filter by trainer ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    trainerId?: number;

    @ApiPropertyOptional({ enum: OrderStatusEnum, description: 'Filter by status' })
    @IsEnum(OrderStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    status?: OrderStatusEnum;

    @ApiPropertyOptional({ example: 'created_at' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    sortBy?: string;

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], example: 'DESC' })
    @IsEnum(['ASC', 'DESC'], { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC';
}
