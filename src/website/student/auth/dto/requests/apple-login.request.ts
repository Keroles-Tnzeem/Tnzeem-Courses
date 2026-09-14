import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppleLoginRequest {
  @ApiProperty({
    description:
      "The identityToken returned by Apple's client SDK after the user signs in. Verified server-side against Apple's public keys — never trusted as-is.",
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  idToken: string;

  @ApiPropertyOptional({
    description:
      "Apple only returns the user's name on the very first authorization — the client must capture and forward it then, since the token itself never carries it.",
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  lastName?: string;
}
