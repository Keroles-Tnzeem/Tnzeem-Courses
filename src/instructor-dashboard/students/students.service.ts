import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../shared/orders/entities/order.entity';
import { QueryStudentRequest } from './dto/requests/query-student.request';
import { InstructorStudentOrderResponse } from './dto/responses/instructor-student-order.response';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';
import { OrderStatusEnum } from '../../shared/orders/enums/order-status.enum';

@Injectable()
export class InstructorStudentsService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async findAll(
    trainerId: number,
    query: QueryStudentRequest,
    lang: string,
  ): Promise<PaginationResponse<InstructorStudentOrderResponse>> {
    const { limit = 10, offset = 0, search, courseId, roundId } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.student', 'student')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.round', 'round')
      .where('order.trainer_id = :trainerId', { trainerId })
      // Only show orders that are either completed or actively having an enrollment
      .andWhere('order.has_enrollment = :hasEnrollment', { hasEnrollment: true });

    if (courseId) {
      qb.andWhere('order.course_id = :courseId', { courseId });
    }

    if (roundId) {
      qb.andWhere('order.round_id = :roundId', { roundId });
    }

    if (search) {
      qb.andWhere(
        "(student.first_name ILIKE :search OR student.last_name ILIKE :search OR student.email ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    qb.orderBy('order.audit.createdAt', 'DESC');

    const [entities, total] = await qb
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((entity) => InstructorStudentOrderResponse.fromEntity(entity, lang));
    const page = Math.floor(offset / limit) + 1;
    return PaginationResponse.success(data, total, page, limit);
  }
}
