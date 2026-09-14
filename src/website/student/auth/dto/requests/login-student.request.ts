import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';

export class LoginStudentRequest {
  @ApiProperty({
    example: '512345678',
    description: 'Saudi mobile without country code',
  })
  @IsSaudiPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  password: string;
}
