import { ApiProperty } from '@nestjs/swagger';
import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';

export class UpdateStudentPhoneRequest {
  @ApiProperty({
    example: '512345678',
    description: 'Saudi mobile without country code',
  })
  @IsSaudiPhoneNumber()
  phone: string;
}
