import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderEntity } from '../../../../../shared/orders/entities/order.entity';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';
import { PaymentMethodEnum } from '../../../../../shared/payment/enums/payment-method.enum';
import { PaymentStatusEnum } from '../../../../../shared/payment/enums/payment-status.enum';
import { getTranslatedString } from '../../../../../common/utils/translation.util';

export class StudentOrderCourse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  image?: string;
}

export class StudentOrderRound {
  @ApiProperty()
  id: number;

  @ApiProperty()
  roundNumber: number;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;
}

export class StudentOrderResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OrderStatusEnum })
  status: OrderStatusEnum;

  @ApiPropertyOptional({ enum: PaymentMethodEnum })
  paymentMethod?: PaymentMethodEnum;

  @ApiPropertyOptional({ enum: PaymentStatusEnum })
  paymentStatus?: PaymentStatusEnum;

  @ApiProperty()
  finalPrice: number;

  @ApiProperty({ type: StudentOrderCourse, nullable: true })
  course: StudentOrderCourse | null;

  @ApiProperty({ type: StudentOrderRound, nullable: true })
  round: StudentOrderRound | null;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(
    entity: OrderEntity,
    lang: string = 'en',
  ): StudentOrderResponse {
    const response = new StudentOrderResponse();
    response.id = entity.id;
    response.status = entity.status;
    response.paymentMethod = entity.paymentMethod;
    response.paymentStatus = entity.paymentStatus;
    response.finalPrice = Number(entity.finalPrice);
    response.createdAt = entity.audit.createdAt;

    response.course = entity.course
      ? {
          id: entity.course.id,
          name: getTranslatedString(entity.course.name, lang),
          image: entity.course.image,
        }
      : null;

    response.round = entity.round
      ? {
          id: entity.round.id,
          roundNumber: entity.round.roundNumber,
          startDate: entity.round.startDate,
          endDate: entity.round.endDate,
        }
      : null;

    return response;
  }
}
