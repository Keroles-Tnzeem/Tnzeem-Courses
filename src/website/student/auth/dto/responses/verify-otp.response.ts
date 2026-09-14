import { ApiProperty } from '@nestjs/swagger';
import { UserDataResponse } from '../../../../../shared/user/dto/responses/user-data.response';

export class VerifyOtpResponse {
  @ApiProperty({ example: true })
  verified: boolean;

  // Always returned on successful verification (all purposes)
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
