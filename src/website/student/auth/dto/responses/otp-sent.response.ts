import { ApiProperty } from '@nestjs/swagger';

export class OtpSentResponse {
  @ApiProperty({ example: '512345678' })
  phone: string;

  @ApiProperty({ example: 300 })
  expiresInSeconds: number;

  @ApiProperty({ example: '123456', required: false })
  code?: string;
}
