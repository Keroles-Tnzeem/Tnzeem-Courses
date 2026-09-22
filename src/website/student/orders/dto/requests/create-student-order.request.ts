import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateStudentOrderRequest {
  @ApiProperty({ example: 1, description: 'Course ID to order' })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  courseId: number;

  @ApiPropertyOptional({ example: 'Please contact me before the round starts' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(500, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  notes?: string;
}
