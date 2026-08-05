import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaymentMethodEnum } from '../../../../shared/payment/enums/payment-method.enum';
import { PaymentTypeEnum } from '../../../../shared/payment/enums/payment-type.enum';
import { OrderCreatorTypeEnum } from '../../../../shared/orders/enums/order-creator-type.enum';

export class CreateOrderRequest {
    @ApiProperty({ example: 1, description: 'Student user ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    studentId: number;

    @ApiProperty({ example: 3, description: 'Round ID to enroll in' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    roundId: number;

    @ApiPropertyOptional({ enum: PaymentTypeEnum, description: 'Payment type: MANUAL or ONLINE' })
    @IsEnum(PaymentTypeEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    paymentType?: PaymentTypeEnum;

    @ApiPropertyOptional({ enum: PaymentMethodEnum, description: 'Payment method (e.g. CASH, BANK_TRANSFER, VISA)' })
    @IsEnum(PaymentMethodEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    paymentMethod?: PaymentMethodEnum;

    @ApiPropertyOptional({ example: 'Paid via bank transfer', description: 'Staff notes about payment' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    paymentNotes?: string;

    @ApiPropertyOptional({ enum: OrderCreatorTypeEnum, default: OrderCreatorTypeEnum.STAFF })
    @IsEnum(OrderCreatorTypeEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    createdBy?: OrderCreatorTypeEnum;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Bank transfer receipt image (optional)' })
    transferBankImg?: any;
}
