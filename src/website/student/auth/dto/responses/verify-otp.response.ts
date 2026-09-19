import { ApiProperty } from '@nestjs/swagger';
import { UserDataResponse } from '../../../../../shared/user/dto/responses/user-data.response';

export class VerifyOtpResponse {
  @ApiProperty({ example: true })
  verified: boolean;

  // Returned for purposes register and login only. forget_password does not
  // sign the user in; they must log in with the new password.
  @ApiProperty({ required: false })
  accessToken?: string;

  @ApiProperty({ required: false })
  refreshToken?: string;

  @ApiProperty({ required: false })
  expireIn?: number;

  @ApiProperty({ required: false })
  url?: string;

  @ApiProperty({ required: false, type: () => UserDataResponse })
  user?: UserDataResponse;
}
