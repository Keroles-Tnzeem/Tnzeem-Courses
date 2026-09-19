import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  Matches,
  MaxLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { OtpPurposeEnum } from '../../enums/otp-purpose.enum';
import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';

export class VerifyOtpRequest {
  @ApiProperty({
    example: '512345678',
    description: 'Saudi mobile without country code',
  })
  @IsSaudiPhoneNumber()
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @Matches(/^\d{6}$/, { message: i18nValidationMessage('validation.INVALID_OTP_CODE') })
  code: string;

  @ApiProperty({ enum: OtpPurposeEnum })
  @IsEnum(OtpPurposeEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  purpose: OtpPurposeEnum;

  @ApiProperty({
    required: false,
    description: `Required when purpose is "${OtpPurposeEnum.FORGET_PASSWORD}" — the new password to set`,
  })
  @ValidateIf(
    (o: VerifyOtpRequest) => o.purpose === OtpPurposeEnum.FORGET_PASSWORD,
  )
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(8, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(72, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, { message: i18nValidationMessage('validation.WEAK_PASSWORD') })
  @IsOptional()
  newPassword?: string;
}
