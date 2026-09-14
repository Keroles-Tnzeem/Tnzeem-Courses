import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginRequest {
  @ApiProperty({
    description:
      "The ID token returned by Google's client SDK after the user signs in. Verified server-side against Google's public keys — never trusted as-is.",
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  idToken: string;
}
