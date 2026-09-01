import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../../shared/user/entities/user.entity';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

export class TrainerProfileResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ enum: GenderEnum, required: false })
  gender?: GenderEnum;

  @ApiProperty()
  img: string;

  @ApiProperty({ required: false })
  age?: number;

  @ApiProperty({ required: false })
  numExperience?: number;

  @ApiProperty({ required: false })
  experience?: string;

  @ApiProperty({ required: false })
  numCourses?: number;

  static from(user: UserEntity): TrainerProfileResponse {
    const response = new TrainerProfileResponse();
    response.id = user.id;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.email = user.email;
    response.phone = user.phone;
    response.gender = user.gender;

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const imgPath = user.img || '/images/empty-user.jpeg';
    response.img = imgPath.startsWith('http') ? imgPath : `${appUrl}${imgPath}`;

    if (user.trainerInfo) {
      response.age = user.trainerInfo.age;
      response.numExperience = user.trainerInfo.numExperience;
      response.experience = user.trainerInfo.experience;
      response.numCourses = user.trainerInfo.numCourses;
    }

    return response;
  }
}
