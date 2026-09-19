import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';
import { PaymentMethodEnum } from '../../../../../shared/payment/enums/payment-method.enum';
import { PaymentStatusEnum } from '../../../../../shared/payment/enums/payment-status.enum';
import { PaymentTypeEnum } from '../../../../../shared/payment/enums/payment-type.enum';

export class QueryOrderRequest {
    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ example: 10, description: 'Items per page' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ example: 'john', description: 'Search by student name or reference' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    keyword?: string;

    @ApiPropertyOptional({ example: '01000000000', description: 'Filter by student phone' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    phone?: string;

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

    @ApiPropertyOptional({ example: 1, description: 'Filter by assigned staff ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    assignToId?: number;

    @ApiPropertyOptional({ enum: OrderStatusEnum, description: 'Filter by order status' })
    @IsEnum(OrderStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    status?: OrderStatusEnum;

    @ApiPropertyOptional({ enum: PaymentTypeEnum, description: 'Filter by payment type' })
    @IsEnum(PaymentTypeEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    paymentType?: PaymentTypeEnum;

    @ApiPropertyOptional({ enum: PaymentMethodEnum, description: 'Filter by payment method' })
    @IsEnum(PaymentMethodEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    paymentMethod?: PaymentMethodEnum;

    @ApiPropertyOptional({ enum: PaymentStatusEnum, description: 'Filter by payment status' })
    @IsEnum(PaymentStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    paymentStatus?: PaymentStatusEnum;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date filter' })
    @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: '2024-01-31', description: 'End date filter' })
    @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE_STRING') })
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    sortBy?: string;

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], example: 'DESC' })
    @IsEnum(['ASC', 'DESC'], { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC';
}
