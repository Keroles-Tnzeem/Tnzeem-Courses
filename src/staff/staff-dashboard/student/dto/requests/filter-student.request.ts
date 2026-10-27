import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationRequest } from '../../../../../common/dto/requests/pagination.request';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';

export class FilterStudentRequest extends PaginationRequest {
  @ApiPropertyOptional({
    description: 'Filter by assigned staff ID (send 0 for unassigned)',
  })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @IsOptional()
  assignToId?: number;

  @ApiPropertyOptional({
    enum: OrderStatusEnum,
    description: 'Filter by student status',
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  status?: OrderStatusEnum;

  @ApiPropertyOptional({
    description: 'Filter by creation date from (YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: i18nValidationMessage('validation.IS_DATE_STRING') },
  )
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date to (YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: i18nValidationMessage('validation.IS_DATE_STRING') },
  )
  @IsOptional()
  to?: string;
}
