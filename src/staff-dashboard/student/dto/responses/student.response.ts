import { UserEntity } from '../../../../shared/user/entities/user.entity';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

export class StudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: GenderEnum;
  img: string;
  sourceId?: number;
  sourceName?: string;
  assignToId?: number;
  assignAt?: Date;
  assignTo?: { firstName: string; lastName: string };

  static from(user: UserEntity): StudentResponse {
    const response = new StudentResponse();
    response.id = user.id;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.email = user.email;
    response.phone = user.phone;
    response.gender = user.gender;
    response.sourceId = user.sourceId;
    response.sourceName = user.source?.name;
    response.assignToId = user.assignToId;
    response.assignAt = user.assignAt;
    if (user.assignToId && user.assignTo) {
      response.assignTo = {
        firstName: user.assignTo.firstName,
        lastName: user.assignTo.lastName,
      };
    }
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const imgPath = user.img || '/images/empty-user.jpeg';
    response.img = `${appUrl}${imgPath}`;
    return response;
  }
}