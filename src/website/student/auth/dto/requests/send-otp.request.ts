import { IsEnum, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { OtpPurposeEnum } from '../../enums/otp-purpose.enum';
import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';

export class SendOtpRequest {
  @ApiProperty({
    example: '512345678',
    description: 'Saudi mobile without country code',
  })
  @IsSaudiPhoneNumber()
  phone: string;

  @ApiProperty({
    enum: OtpPurposeEnum,
    description:
      'What the OTP is for: register (verify phone after sign-up), login (passwordless login), forget_password (reset password)',
  })
  @IsEnum(OtpPurposeEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  purpose: OtpPurposeEnum;
}
