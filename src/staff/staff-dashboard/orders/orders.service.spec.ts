import { OrdersService } from './orders.service';
import { OrderResponse } from './dto/responses/order.response';
import { OrderStatusEnum } from '../../../shared/orders/enums/order-status.enum';
import { OrderCreatorTypeEnum } from '../../../shared/orders/enums/order-creator-type.enum';

describe('OrdersService - isDuplicate', () => {
  let service: OrdersService;
  let ordersRepository: any;
  let roundsService: any;
  let enrollmentsService: any;
  let i18n: any;
  let orderCommentRepository: any;
  let courseRepository: any;
  let notificationsService: any;

  beforeEach(() => {
    ordersRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    roundsService = {};
    enrollmentsService = {};
    i18n = { t: jest.fn((key) => key) };
    orderCommentRepository = {
      findByIds: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
    };
    courseRepository = {};
    notificationsService = { notify: jest.fn() };

    service = new OrdersService(
      ordersRepository,
      roundsService as any,
      enrollmentsService as any,
      i18n,
      orderCommentRepository,
      courseRepository as any,
      notificationsService as any,
    );
  });

  it('marks isDuplicate as true for repeated students and false for single-order students in findAll', async () => {
    const mockEntities = [
      {
        id: 'ORDER_1',
        studentId: 10,
        mainPrice: 100,
        priceAfterDiscount: 100,
        finalPrice: 100,
        status: OrderStatusEnum.PENDING,
        createdBy: OrderCreatorTypeEnum.STAFF,
        audit: { createdAt: new Date(), updatedAt: new Date() },
      },
      {
        id: 'ORDER_2',
        studentId: 20,
        mainPrice: 200,
        priceAfterDiscount: 200,
        finalPrice: 200,
        status: OrderStatusEnum.PENDING,
        createdBy: OrderCreatorTypeEnum.STAFF,
        audit: { createdAt: new Date(), updatedAt: new Date() },
      },
    ];

    const mainQb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockEntities, 2]),
    };

    const duplicateQb: any = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ studentId: '10' }]),
    };

    ordersRepository.createQueryBuilder
      .mockReturnValueOnce(mainQb)
      .mockReturnValueOnce(duplicateQb);

    const result = await service.findAll({} as any, 'en');

    expect(result.data).toHaveLength(2);
    // Student 10 has duplicate orders
    expect(result.data[0].id).toBe('ORDER_1');
    expect(result.data[0].studentId).toBe(10);
    expect(result.data[0].isDuplicate).toBe(true);

    // Student 20 has only 1 order
    expect(result.data[1].id).toBe('ORDER_2');
    expect(result.data[1].studentId).toBe(20);
    expect(result.data[1].isDuplicate).toBe(false);
  });

  it('delegates findMyOrders to findAll and preserves isDuplicate', async () => {
    const mockEntities = [
      {
        id: 'ORDER_MY',
        studentId: 55,
        mainPrice: 150,
        priceAfterDiscount: 150,
        finalPrice: 150,
        status: OrderStatusEnum.PENDING,
        createdBy: OrderCreatorTypeEnum.STAFF,
        audit: { createdAt: new Date(), updatedAt: new Date() },
      },
    ];

    const mainQb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockEntities, 1]),
    };

    const duplicateQb: any = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    ordersRepository.createQueryBuilder
      .mockReturnValueOnce(mainQb)
      .mockReturnValueOnce(duplicateQb);

    const result = await service.findMyOrders(999, {} as any, 'en');

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('ORDER_MY');
    expect(result.data[0].isDuplicate).toBe(false);
  });
});
