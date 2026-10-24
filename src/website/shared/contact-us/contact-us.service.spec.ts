import { ConflictException, NotFoundException } from '@nestjs/common';
import { ContactUsService } from './contact-us.service';
import { CourseStatusEnum } from '../../../staff/staff-dashboard/courses/enums/course-status.enum';
import { UserTypeEnum } from '../../../shared/user/enums/user-type.enum';
import { OrderStatusEnum } from '../../../shared/orders/enums/order-status.enum';

describe('ContactUsService.makeOrder', () => {
  let service: ContactUsService;
  let inquiryRepo: any;
  let courseRepo: any;
  let userRepo: any;
  let orderRepo: any;
  let i18n: any;

  beforeEach(() => {
    inquiryRepo = {
      create: jest.fn((v) => ({ ...v })),
      save: jest.fn(async (v) => ({ id: 1, ...v })),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })),
    };

    courseRepo = {
      findOne: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
      create: jest.fn((v) => ({ ...v })),
      save: jest.fn(async (v) => ({ id: 99, ...v, audit: { createdAt: new Date() } })),
    };

    orderRepo = {
      create: jest.fn((v) => ({ ...v })),
      save: jest.fn(async (v) => ({
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        audit: { createdAt: new Date() },
        ...v,
      })),
      findOne: jest.fn(),
    };

    i18n = {
      t: jest.fn((key: string) => key),
    };

    const sourcesService = {
      findIdByName: jest.fn().mockResolvedValue(1),
    };

    service = new ContactUsService(
      inquiryRepo,
      courseRepo,
      userRepo,
      orderRepo,
      sourcesService as any,
      i18n,
    );
  });

  it('throws NotFoundException if the course is not found or not published', async () => {
    courseRepo.findOne.mockResolvedValue(null);

    await expect(
      service.makeOrder({
        phone: '512345678',
        courseId: 999,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ConflictException if the phone number belongs to a non-student user', async () => {
    courseRepo.findOne.mockResolvedValue({
      id: 1,
      status: CourseStatusEnum.PUBLISHED,
      price: 500,
      trainerId: 10,
    });
    userRepo.findOne.mockResolvedValue({
      id: 5,
      phone: '512345678',
      userType: UserTypeEnum.TRAINER,
    });

    await expect(
      service.makeOrder({
        phone: '512345678',
        courseId: 1,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('reuses existing student data if phone exists as student', async () => {
    const existingStudent = {
      id: 42,
      firstName: 'Existing',
      lastName: 'Student',
      phone: '512345678',
      userType: UserTypeEnum.STUDENT,
    };

    courseRepo.findOne.mockResolvedValue({
      id: 1,
      status: CourseStatusEnum.PUBLISHED,
      price: 250,
      trainerId: 5,
      name: { en: 'NestJS Course', ar: 'دورة نست' },
    });
    userRepo.findOne.mockResolvedValue(existingStudent);

    orderRepo.findOne.mockImplementation(async ({ where }: any) => ({
      id: where.id,
      studentId: existingStudent.id,
      courseId: 1,
      mainPrice: 250,
      finalPrice: 250,
      status: OrderStatusEnum.PENDING,
      student: existingStudent,
      course: {
        id: 1,
        name: { en: 'NestJS Course', ar: 'دورة نست' },
      },
      audit: { createdAt: new Date() },
    }));

    const result = await service.makeOrder({
      phone: '512345678',
      courseId: 1,
      notes: 'Please call me',
    });

    expect(userRepo.create).not.toHaveBeenCalled();
    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 42,
        courseId: 1,
        mainPrice: 250,
        finalPrice: 250,
        notes: 'Please call me',
      }),
    );
    expect(result.isNewStudent).toBe(false);
    expect(result.studentId).toBe(42);
    expect(result.courseId).toBe(1);
  });

  it('creates new student and links unassigned inquiries if student does not exist', async () => {
    courseRepo.findOne.mockResolvedValue({
      id: 2,
      status: CourseStatusEnum.PUBLISHED,
      price: 400,
      trainerId: 8,
      name: { en: 'React Course', ar: 'دورة رياكت' },
    });
    userRepo.findOne.mockResolvedValue(null);

    orderRepo.findOne.mockImplementation(async ({ where }: any) => ({
      id: where.id,
      studentId: 99,
      courseId: 2,
      mainPrice: 400,
      finalPrice: 400,
      status: OrderStatusEnum.PENDING,
      student: {
        id: 99,
        firstName: 'Saleh',
        lastName: 'Alharbi',
        phone: '598765432',
      },
      course: {
        id: 2,
        name: { en: 'React Course', ar: 'دورة رياكت' },
      },
      audit: { createdAt: new Date() },
    }));

    const result = await service.makeOrder({
      phone: '598765432',
      courseId: 2,
      source: 'google',
    });

    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: '',
        lastName: '',
        email: '',
        phone: '598765432',
        userType: UserTypeEnum.STUDENT,
        sourceId: 1,
      }),
    );
    expect(inquiryRepo.createQueryBuilder).toHaveBeenCalled();
    expect(orderRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 99,
        courseId: 2,
        mainPrice: 400,
        finalPrice: 400,
      }),
    );
    expect(result.isNewStudent).toBe(true);
    expect(result.studentId).toBe(99);
  });
});
