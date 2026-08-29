import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EnrollmentStatusEnum } from '../../../../shared/enrollments/enums/enrollment-status.enum';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateEnrollmentRequest {
  @ApiProperty({ example: 1, description: 'ID of the student to enroll' })
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  studentId: number;

  @ApiProperty({ example: 5, description: 'ID of the round to enroll the student in' })
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1)
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  roundId: number;

  @ApiPropertyOptional({ enum: EnrollmentStatusEnum, example: EnrollmentStatusEnum.ACTIVE, default: EnrollmentStatusEnum.PENDING })
  @IsOptional()
  @IsEnum(EnrollmentStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  status?: EnrollmentStatusEnum;
}
