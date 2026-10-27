import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';

export class UpdateStudentStatusRequest {
  @ApiProperty({
    enum: OrderStatusEnum,
    example: OrderStatusEnum.PENDING,
    description: 'Student status',
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsEnum(OrderStatusEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  status: OrderStatusEnum;
}
