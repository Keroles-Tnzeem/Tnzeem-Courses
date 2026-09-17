import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderEntity } from '../../../../../shared/orders/entities/order.entity';
import { PaymentTypeEnum } from '../../../../../shared/payment/enums/payment-type.enum';
import { CourseLevelEnum } from '../../../../../common/enums/course-level.enum';
import { RoundStatusEnum } from '../../../../../staff/staff-dashboard/rounds/enums/round-status.enum';
import { getTranslatedString } from '../../../../../common/utils/translation.util';
import {
  StudentOrderCourse,
  StudentOrderResponse,
  StudentOrderRound,
} from './student-order.response';

export class StudentOrderCourseDetails extends StudentOrderCourse {
  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  sessionsCount?: number;

  @ApiPropertyOptional()
  durationHours?: number;

  @ApiPropertyOptional({ enum: CourseLevelEnum })
  level?: CourseLevelEnum;
}

export class StudentOrderRoundDetails extends StudentOrderRound {
  @ApiPropertyOptional({ enum: RoundStatusEnum })
  status?: RoundStatusEnum;

  @ApiPropertyOptional()
  notes?: string;
}

export class StudentOrderDetailsResponse extends StudentOrderResponse {
  @ApiPropertyOptional({ enum: PaymentTypeEnum })
  paymentType?: PaymentTypeEnum;

  @ApiPropertyOptional()
  paymentReference?: string;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ type: StudentOrderCourseDetails, nullable: true })
  declare course: StudentOrderCourseDetails | null;

  @ApiProperty({ type: StudentOrderRoundDetails, nullable: true })
  declare round: StudentOrderRoundDetails | null;

  static fromEntity(
    entity: OrderEntity,
    lang: string = 'en',
  ): StudentOrderDetailsResponse {
    const base = StudentOrderResponse.fromEntity(entity, lang);
    const response = Object.assign(new StudentOrderDetailsResponse(), base);

    response.paymentType = entity.paymentType;
    response.paymentReference = entity.paymentReference;
    response.paidAt = entity.paidAt;
    response.notes = entity.notes;

    response.course = entity.course
      ? {
          id: entity.course.id,
          name: getTranslatedString(entity.course.name, lang),
          image: entity.course.image,
          description: getTranslatedString(entity.course.description, lang),
          sessionsCount: entity.course.sessionsCount,
          durationHours: entity.course.durationHours,
          level: entity.course.level,
        }
      : null;

    response.round = entity.round
      ? {
          id: entity.round.id,
          roundNumber: entity.round.roundNumber,
          startDate: entity.round.startDate,
          endDate: entity.round.endDate,
          status: entity.round.status,
          notes: entity.round.notes,
        }
      : null;

    return response;
  }
}
