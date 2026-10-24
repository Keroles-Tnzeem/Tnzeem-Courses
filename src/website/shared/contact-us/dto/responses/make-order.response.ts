import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderEntity } from '../../../../../shared/orders/entities/order.entity';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';
import { PaymentMethodEnum } from '../../../../../shared/payment/enums/payment-method.enum';
import { PaymentStatusEnum } from '../../../../../shared/payment/enums/payment-status.enum';
import { getTranslatedString } from '../../../../../common/utils/translation.util';

export class MakeOrderStudentResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  phone?: string;
}

export class MakeOrderCourseResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  image?: string;
}

export class MakeOrderResponse {
  @ApiProperty({ description: 'Order ULID' })
  id: string;

  @ApiProperty({ description: 'Student ID' })
  studentId: number;

  @ApiProperty({ description: 'Course ID' })
  courseId: number;

  @ApiProperty({ enum: OrderStatusEnum })
  status: OrderStatusEnum;

  @ApiPropertyOptional({ enum: PaymentMethodEnum })
  paymentMethod?: PaymentMethodEnum;

  @ApiPropertyOptional({ enum: PaymentStatusEnum })
  paymentStatus?: PaymentStatusEnum;

  @ApiProperty()
  mainPrice: number;

  @ApiProperty()
  finalPrice: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({
    description: 'Whether a new student account was automatically created',
  })
  isNewStudent: boolean;

  @ApiPropertyOptional({ type: MakeOrderStudentResponse })
  student?: MakeOrderStudentResponse;

  @ApiPropertyOptional({ type: MakeOrderCourseResponse })
  course?: MakeOrderCourseResponse;

  @ApiProperty()
  createdAt: Date;

  static from(
    entity: OrderEntity,
    isNewStudent: boolean,
    lang: string = 'en',
  ): MakeOrderResponse {
    const res = new MakeOrderResponse();
    res.id = entity.id;
    res.studentId = entity.studentId;
    res.courseId = entity.courseId ?? 0;
    res.status = entity.status;
    res.paymentMethod = entity.paymentMethod;
    res.paymentStatus = entity.paymentStatus;
    res.mainPrice = Number(entity.mainPrice);
    res.finalPrice = Number(entity.finalPrice);
    res.notes = entity.notes;
    res.isNewStudent = isNewStudent;
    res.createdAt = entity.audit?.createdAt ?? new Date();

    if (entity.student) {
      res.student = {
        id: entity.student.id,
        firstName: entity.student.firstName,
        lastName: entity.student.lastName,
        phone: entity.student.phone,
      };
    }

    if (entity.course) {
      res.course = {
        id: entity.course.id,
        name: getTranslatedString(entity.course.name, lang),
        image: entity.course.image,
      };
    }

    return res;
  }
}
