import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  IsNull,
  ILike,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { UserEntity } from '../../../shared/user/entities/user.entity';
import { UserTypeEnum } from '../../../shared/user/enums/user-type.enum';
import { OrderStatusEnum } from '../../../shared/orders/enums/order-status.enum';
import { SourceEntity } from '../sources/entities/source.entity';
import { CreateStudentRequest } from './dto/requests/create-student.request';
import { UpdateStudentRequest } from './dto/requests/update-student.request';
import { AssignStaffToStudentRequest } from './dto/requests/assign-staff.request';
import { FilterStudentRequest } from './dto/requests/filter-student.request';
import { OrdersRepository } from '../../../shared/orders/repositories/orders.repository';
import { getLang } from '../../../common/helpers/lang.helper';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SourceEntity)
    private readonly sourceRepo: Repository<SourceEntity>,
    private readonly ordersRepository: OrdersRepository,
    private readonly i18n: I18nService,
  ) {}

  private readonly relations = { source: true, assignTo: true };

  private async ensureSourceExists(sourceId?: number | null): Promise<void> {
    if (sourceId == null) {
      return;
    }

    const source = await this.sourceRepo.findOne({ where: { id: sourceId } });
    if (!source) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }),
      );
    }
  }

  async findAll(
    query: FilterStudentRequest,
  ): Promise<{ data: UserEntity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      assignToId,
      from,
      to,
      status,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { userType: UserTypeEnum.STUDENT };
    if (search) {
      where.firstName = search; // adjust if ILike needed
    }
    if (status) {
      where.status = status;
    }
    if (assignToId !== undefined && assignToId !== null) {
      if (Number(assignToId) === 0) {
        where.assignToId = IsNull();
      } else {
        where.assignToId = assignToId;
      }
    }
    if (from || to) {
      where.audit = {};
      if (from && to) {
        where.audit.createdAt = Between(
          new Date(`${from}T00:00:00.000Z`),
          new Date(`${to}T23:59:59.999Z`),
        );
      } else if (from) {
        where.audit.createdAt = MoreThanOrEqual(
          new Date(`${from}T00:00:00.000Z`),
        );
      } else if (to) {
        where.audit.createdAt = LessThanOrEqual(
          new Date(`${to}T23:59:59.999Z`),
        );
      }
    }

    const [data, total] = await this.userRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'DESC' },
      relations: this.relations,
    });

    return { data, total };
  }

  async findMyStudents(
    userId: number,
    query: FilterStudentRequest,
  ): Promise<{ data: UserEntity[]; total: number }> {
    const { page = 1, limit = 10, search, from, to, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userType: UserTypeEnum.STUDENT,
      assignToId: userId,
    };

    if (search) {
      where.firstName = search;
    }
    if (status) {
      where.status = status;
    }
    if (from || to) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.audit = {};
      if (from && to) {
        where.audit.createdAt = Between(
          new Date(`${from}T00:00:00.000Z`),
          new Date(`${to}T23:59:59.999Z`),
        );
      } else if (from) {
        where.audit.createdAt = MoreThanOrEqual(
          new Date(`${from}T00:00:00.000Z`),
        );
      } else if (to) {
        where.audit.createdAt = LessThanOrEqual(
          new Date(`${to}T23:59:59.999Z`),
        );
      }
    }

    const [data, total] = await this.userRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'DESC' },
      relations: this.relations,
    });

    return { data, total };
  }

  // ── Single
  async findOne(id: number): Promise<UserEntity> {
    const student = await this.userRepo.findOne({
      where: { id },
      relations: this.relations,
    });

    if (!student || student.userType !== UserTypeEnum.STUDENT) {
      throw new NotFoundException(
        this.i18n.t('errors.STUDENT_NOT_FOUND', { lang: getLang() }),
      );
    }

    return student;
  }

  async findByPhone(phone: string): Promise<UserEntity[]> {
    const raw = phone.trim();
    if (!raw) {
      return [];
    }

    const cleaned = raw.replace(/[\s\-]/g, '');
    const withoutCountry = cleaned.replace(/^(\+966|00966|966)/, '');
    const withoutZero = withoutCountry.startsWith('0')
      ? withoutCountry.slice(1)
      : withoutCountry;

    const searchPatterns = Array.from(
      new Set([raw, cleaned, withoutCountry, withoutZero].filter(Boolean)),
    );

    return await this.userRepo.find({
      where: searchPatterns.map((pattern) => ({
        userType: UserTypeEnum.STUDENT,
        phone: ILike(`%${pattern}%`),
      })),
      relations: this.relations,
      take: 20,
      order: { id: 'DESC' },
    });
  }

  async create(dto: CreateStudentRequest): Promise<UserEntity> {
    if (dto.email) {
      const exists = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (exists) {
        throw new ConflictException(
          this.i18n.t('errors.EMAIL_TAKEN', { lang: getLang() }),
        );
      }
    }

    if (dto.phone) {
      const phoneExists = await this.userRepo.findOne({
        where: { phone: dto.phone },
      });
      if (phoneExists) {
        throw new ConflictException(
          this.i18n.t('errors.PHONE_TAKEN', { lang: getLang() }),
        );
      }
    }

    const randomDummyPassword = Math.random().toString(36).slice(-10);
    const hashed = await bcrypt.hash(randomDummyPassword, 10);

    await this.ensureSourceExists(dto.sourceId);

    const student = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      gender: dto.gender,
      password: hashed,
      userType: UserTypeEnum.STUDENT,
      sourceId: dto.sourceId,
      status: dto.status ?? OrderStatusEnum.PENDING,
    });

    const saved = await this.userRepo.save(student);

    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateStudentRequest): Promise<UserEntity> {
    const student = await this.findOne(id);

    if (dto.email && dto.email !== student.email) {
      const exists = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (exists) {
        throw new ConflictException(
          this.i18n.t('errors.EMAIL_TAKEN', { lang: getLang() }),
        );
      }
    }

    if (dto.phone && dto.phone !== student.phone) {
      const phoneExists = await this.userRepo.findOne({
        where: { phone: dto.phone },
      });
      if (phoneExists) {
        throw new ConflictException(
          this.i18n.t('errors.PHONE_TAKEN', { lang: getLang() }),
        );
      }
    }

    if (dto.sourceId !== undefined) {
      await this.ensureSourceExists(dto.sourceId);
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.isActive !== undefined) {
      student.isActive = dto.isActive;
    }

    Object.assign(student, dto);
    await this.userRepo.save(student);

    return this.findOne(id);
  }

  async updateStatus(id: number, status: OrderStatusEnum): Promise<UserEntity> {
    const student = await this.findOne(id);
    student.status = status;
    await this.userRepo.save(student);
    return this.findOne(id);
  }

  // ── Assign Staff ──────────────────────────────────────────────────────────
  async assignStaff(
    studentId: number,
    dto: AssignStaffToStudentRequest,
  ): Promise<UserEntity> {
    const student = await this.findOne(studentId);

    const staffUser = await this.userRepo.findOne({
      where: [
        { id: dto.assignToId, userType: UserTypeEnum.SALES },
        { id: dto.assignToId, userType: UserTypeEnum.SUPPORT },
      ],
    });

    if (!staffUser) {
      throw new NotFoundException(
        this.i18n.t('errors.USER_NOT_FOUND', { lang: getLang() }),
      );
    }

    student.assignToId = dto.assignToId;
    student.assignTo = staffUser;
    student.assignAt = new Date();

    await this.userRepo.save(student);

    // Update all existing orders for this student to be assigned to this staff member
    await this.ordersRepository.update(
      { studentId },
      { assignToId: dto.assignToId },
    );

    return this.findOne(studentId);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.userRepo.remove(student);
  }
}
