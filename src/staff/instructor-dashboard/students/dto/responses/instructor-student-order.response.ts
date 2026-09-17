import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderEntity } from 'src/shared/orders/entities/order.entity';

export class InstructorStudentOrderResponse {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  status: string;

  @ApiProperty({ description: 'Student basic info' })
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };

  @ApiPropertyOptional({ description: 'Course basic info' })
  course?: {
    id: number;
    name: string;
  };

  @ApiPropertyOptional({ description: 'Round basic info' })
  round?: {
    id: number;
    name: string;
  };

  static fromEntity(
    entity: OrderEntity,
    lang: string = 'en',
  ): InstructorStudentOrderResponse {
    const response = new InstructorStudentOrderResponse();
    response.orderId = entity.id;
    response.createdAt = entity.audit?.createdAt;
    response.status = entity.status;

    if (entity.student) {
      response.student = {
        id: entity.student.id,
        firstName: entity.student.firstName,
        lastName: entity.student.lastName,
        email: entity.student.email,
        phone: entity.student.phone,
      };
    }

    if (entity.course) {
      response.course = {
        id: entity.course.id,
        name: entity.course.name?.[lang] || entity.course.name?.en || '',
      };
    }

    if (entity.round) {
      response.round = {
        id: entity.round.id,
        name: `Round ${entity.round.roundNumber}`,
      };
    }

    return response;
  }
}
