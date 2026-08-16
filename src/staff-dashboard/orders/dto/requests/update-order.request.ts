import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OrderStatusEnum } from '../../../../shared/orders/enums/order-status.enum';
import { PaymentMethodEnum } from '../../../../shared/payment/enums/payment-method.enum';
import { PaymentStatusEnum } from '../../../../shared/payment/enums/payment-status.enum';
import { PaymentTypeEnum } from '../../../../shared/payment/enums/payment-type.enum';

export class UpdateOrderRequest {
    // Status

    @ApiPropertyOptional({ enum: OrderStatusEnum })
    @IsEnum(OrderStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    status?: OrderStatusEnum;

    // Payment

    @ApiPropertyOptional({ enum: PaymentTypeEnum })
    @IsEnum(PaymentTypeEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    paymentType?: PaymentTypeEnum;

    @ApiPropertyOptional({ enum: PaymentMethodEnum })
    @IsEnum(PaymentMethodEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    paymentMethod?: PaymentMethodEnum;

    @ApiPropertyOptional({ enum: PaymentStatusEnum })
    @IsEnum(PaymentStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    paymentStatus?: PaymentStatusEnum;

    @ApiPropertyOptional({ example: 'Updated payment notes' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    paymentNotes?: string;

    @ApiPropertyOptional({ example: '2025-01-15T10:30:00Z', description: 'Date/time of payment' })
    @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE') })
    @IsOptional()
    paidAt?: string;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Bank transfer receipt image' })
    transferBankImg?: any;

    @ApiPropertyOptional({ description: 'Staff user ID to assign this order to' })
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @IsOptional()
    assignToId?: number;
}
