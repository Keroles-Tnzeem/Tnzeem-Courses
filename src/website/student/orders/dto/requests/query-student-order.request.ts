import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';

export class QueryStudentOrderRequest {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    enum: OrderStatusEnum,
    description: 'Filter by order status',
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  status?: OrderStatusEnum;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], example: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
