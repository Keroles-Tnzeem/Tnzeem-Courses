import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { EnrollmentStatusEnum } from '../../../../shared/enrollments/enums/enrollment-status.enum';

export class UpdateEnrollmentRequest {
  @ApiPropertyOptional({ enum: EnrollmentStatusEnum, example: EnrollmentStatusEnum.COMPLETED })
  @IsOptional()
  @IsEnum(EnrollmentStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  status?: EnrollmentStatusEnum;
}
