import { UserEntity } from '../../../../../shared/user/entities/user.entity';
import { GenderEnum } from '../../../../../shared/user/enums/gender.enum';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';
import { buildUserImageUrl } from '../../../../../common/utils/user-image.util';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty({ enum: GenderEnum })
  gender: GenderEnum;

  @ApiProperty({ enum: OrderStatusEnum, default: OrderStatusEnum.PENDING })
  status: OrderStatusEnum;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  img: string;

  @ApiPropertyOptional()
  sourceId?: number;

  @ApiPropertyOptional()
  sourceName?: string;

  @ApiPropertyOptional()
  assignToId?: number;

  @ApiPropertyOptional()
  assignAt?: Date;

  @ApiPropertyOptional()
  assignTo?: { firstName: string; lastName: string };

  static from(user: UserEntity): StudentResponse {
    const response = new StudentResponse();
    response.id = user.id;
    response.firstName = user.firstName;
    response.lastName = user.lastName;
    response.email = user.email;
    response.phone = user.phone;
    response.gender = user.gender;
    response.status = user.status;
    response.isActive = user.isActive;
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
    response.img = buildUserImageUrl(user.img);
    response.createdAt = user.audit.createdAt;
    return response;
  }
}
