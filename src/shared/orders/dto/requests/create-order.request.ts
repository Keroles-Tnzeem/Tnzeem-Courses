import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

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

    @ApiProperty({ example: 5, description: 'Trainer user ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    trainerId: number;

    @ApiProperty({ example: 500, description: 'Original course price at time of order' })
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(0, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    mainPrice: number;

    @ApiProperty({ example: 450, description: 'Price after applying any discount' })
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(0, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    priceAfterDiscount: number;

    @ApiProperty({ example: 450, description: 'Actual amount the student pays' })
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(0, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    finalPrice: number;

    @ApiPropertyOptional({ example: 'Referred by a friend' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    notes?: string;
}
