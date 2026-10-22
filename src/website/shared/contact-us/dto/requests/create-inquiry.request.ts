import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';

export class CreateInquiryRequest {
  @ApiProperty({
    example: '512345678',
    description: 'Saudi mobile number without country code',
  })
  @IsSaudiPhoneNumber()
  phone: string;

  @ApiProperty({ example: 1, description: 'ID of the course being inquired about' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  courseId: number;

  @ApiPropertyOptional({
    example: 'I would like to know more about the schedule.',
    description: 'Optional free-text notes',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(1000, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  notes?: string;
}
