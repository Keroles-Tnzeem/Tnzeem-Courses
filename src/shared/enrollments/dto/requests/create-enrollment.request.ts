import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatusEnum } from '../../enums/enrollment-status.enum';

export class CreateEnrollmentRequest {
    @ApiProperty({ example: 1, description: 'ID of the student to enroll' })
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    studentId: number;

    @ApiProperty({ example: 5, description: 'ID of the round to enroll in' })
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    roundId: number;

    @ApiProperty({ example: '01J4ZB4XYZQWERYT1234567891', description: 'Associated order ID (optional)', required: false })
    @Type(() => String)
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    orderId?: string;

    @ApiProperty({ enum: EnrollmentStatusEnum, example: EnrollmentStatusEnum.PENDING, description: 'Enrollment status (optional, defaults to PENDING)', required: false })
    @IsOptional()
    @IsEnum(EnrollmentStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    status?: EnrollmentStatusEnum;
}
