import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatusEnum } from '../../enums/enrollment-status.enum';

export class QueryEnrollmentRequest {
    @ApiProperty({ example: 1, description: 'Page number', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    page?: number;

    @ApiProperty({ example: 10, description: 'Number of items per page', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    limit?: number;

    @ApiProperty({ example: 'John', description: 'Search query', required: false })
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    search?: string;

    @ApiProperty({ example: 1, description: 'Filter by student ID', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    studentId?: number;

    @ApiProperty({ example: 5, description: 'Filter by round ID', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    roundId?: number;

    @ApiProperty({ enum: EnrollmentStatusEnum, example: EnrollmentStatusEnum.ACTIVE, description: 'Filter by enrollment status', required: false })
    @IsOptional()
    @IsEnum(EnrollmentStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    status?: EnrollmentStatusEnum;
}
