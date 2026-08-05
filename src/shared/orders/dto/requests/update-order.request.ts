import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OrderStatusEnum } from '../../enums/order-status.enum';

export class UpdateOrderRequest {
    @ApiPropertyOptional({ example: 1, description: 'Override trainer user ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    trainerId?: number;

    @ApiPropertyOptional({ example: 500 })
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(0, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    mainPrice?: number;

    @ApiPropertyOptional({ example: 450 })
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(0, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    priceAfterDiscount?: number;

    @ApiPropertyOptional({ example: 450 })
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(0, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    finalPrice?: number;

    @ApiPropertyOptional({ enum: OrderStatusEnum })
    @IsEnum(OrderStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    status?: OrderStatusEnum;
}
