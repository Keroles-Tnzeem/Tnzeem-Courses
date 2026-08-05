import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaymentStatusEnum } from '../enums/payment-status.enum';

export class UpdatePaymentStatusDto {
    @ApiProperty({ enum: PaymentStatusEnum, description: 'New payment status' })
    @IsEnum(PaymentStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    paymentStatus: PaymentStatusEnum;

    @ApiPropertyOptional({ example: 'Payment verified manually by staff', description: 'Additional notes regarding the status change' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    notes?: string;
}
