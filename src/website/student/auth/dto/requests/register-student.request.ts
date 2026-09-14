import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { GenderEnum } from '../../../../../shared/user/enums/gender.enum';
import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';

export class RegisterStudentRequest {
  @ApiProperty()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  firstName: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  lastName: string;

  @ApiProperty()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  email: string;

  @ApiProperty({
    example: '512345678',
    description: 'Saudi mobile without country code',
  })
  @IsSaudiPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(8, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  password: string;

  @ApiProperty({ enum: GenderEnum, required: false })
  @IsOptional()
  @IsEnum(GenderEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  gender?: GenderEnum;

  @ApiProperty({
    required: false,
    example: 'Google',
    description: 'Where the student came from (referral/marketing source)',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  source?: string;
}
