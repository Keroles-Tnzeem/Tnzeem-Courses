import { IsEnum, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatusEnum } from '../../enums/enrollment-status.enum';

export class UpdateEnrollmentRequest {
    @ApiProperty({ enum: EnrollmentStatusEnum, example: EnrollmentStatusEnum.COMPLETED, description: 'New status for the enrollment', required: false })
    @IsOptional()
    @IsEnum(EnrollmentStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    status?: EnrollmentStatusEnum;
}
