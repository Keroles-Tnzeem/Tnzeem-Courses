import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { OrdersRepository } from '../../../shared/orders/repositories/orders.repository';
import { PaginationResponseDto as PaginationResponse } from '../../../common/dto/responses/pagination.response';
import { QueryStudentOrderRequest } from './dto/requests/query-student-order.request';
import { StudentOrderResponse } from './dto/responses/student-order.response';
import { StudentOrderDetailsResponse } from './dto/responses/student-order-details.response';

@Injectable()
export class StudentOrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly i18n: I18nService,
  ) {}

  async findAll(
    studentId: number,
    query: QueryStudentOrderRequest,
    lang: string,
  ): Promise<PaginationResponse<StudentOrderResponse>> {
    const { page = 1, limit = 10, status, sortOrder = 'DESC' } = query;

    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.round', 'round')
      .where('order.student_id = :studentId', { studentId });

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.audit.createdAt', sortOrder);

    const [entities, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = entities.map((e) => StudentOrderResponse.fromEntity(e, lang));
    return PaginationResponse.success(data, total, page, limit);
  }

  async findOne(
    studentId: number,
    id: string,
    lang: string,
  ): Promise<StudentOrderDetailsResponse> {
    const order = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.course', 'course')
      .leftJoinAndSelect('order.round', 'round')
      .where('order.id = :id', { id })
      .andWhere('order.student_id = :studentId', { studentId })
      .getOne();

    if (!order) {
      throw new NotFoundException(
        this.i18n.t('errors.ORDER_NOT_FOUND', { lang }),
      );
    }

    return StudentOrderDetailsResponse.fromEntity(order, lang);
  }
}
