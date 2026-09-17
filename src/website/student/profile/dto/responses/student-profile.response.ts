import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../../../shared/user/entities/user.entity';
import { GenderEnum } from '../../../../../shared/user/enums/gender.enum';

export class StudentProfileResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  phoneVerified: boolean;

  @ApiProperty({ enum: GenderEnum, required: false })
  gender?: GenderEnum;

  @ApiProperty()
  img: string;

  static from(user: UserEntity): StudentProfileResponse {
    const response = new StudentProfileResponse();
    response.id = user.id;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.email = user.email;
    response.phone = user.phone;
    response.phoneVerified = !!user.phoneVerifiedAt;
    response.gender = user.gender;

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const imgPath = user.img || '/images/empty-user.jpeg';
    response.img = imgPath.startsWith('http') ? imgPath : `${appUrl}${imgPath}`;

    return response;
  }
}
