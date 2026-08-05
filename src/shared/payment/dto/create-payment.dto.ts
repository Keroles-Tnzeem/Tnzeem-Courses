import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

export class CreatePaymentDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Order ID' })
    @IsUUID('4', { message: i18nValidationMessage('validation.IS_UUID') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    orderId: string;

    @ApiProperty({ enum: PaymentMethodEnum, description: 'Payment Method (e.g., CASH, BANK_TRANSFER)' })
    @IsEnum(PaymentMethodEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    paymentMethod: PaymentMethodEnum;

    @ApiPropertyOptional({ example: 'TRX-987654321', description: 'Reference number from the bank or payment gateway' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    referenceNumber?: string;

    @ApiPropertyOptional({ example: 'Paid at the branch', description: 'Additional notes' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    notes?: string;
}
