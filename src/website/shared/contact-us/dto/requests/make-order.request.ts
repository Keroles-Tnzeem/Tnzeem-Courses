import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';

export class MakeOrderRequest {
  @ApiProperty({
    example: '512345678',
    description:
      'Saudi mobile number without country code or with leading 0 (e.g. 512345678 or 0512345678)',
  })
  @IsSaudiPhoneNumber()
  phone: string;

  @ApiProperty({ example: 1, description: 'ID of the course being ordered' })
  @Transform(({ obj, value }) => value ?? obj?.course_id)
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  courseId: number;

  @ApiPropertyOptional({
    example: 'google',
    description: 'Lead / referral source name (optional)',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  source?: string;
}
