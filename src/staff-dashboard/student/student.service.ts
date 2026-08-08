import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';
import { SourceEntity } from '../sources/entities/source.entity';
import { CreateStudentRequest } from './dto/requests/create-student.request';
import { UpdateStudentRequest } from './dto/requests/update-student.request';
import { AssignStaffToStudentRequest } from './dto/requests/assign-staff.request';
import { PaginationRequest } from '../../common/dto/requests/pagination.request';
import { OrdersRepository } from '../../shared/orders/repositories/orders.repository';
import {getLang} from "../../common/helpers/lang.helper";

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



  private readonly relations = { source: true };

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

  // ── List ─────────────────────────────────────────────────────────────────
  async findAll(
    query: PaginationRequest,
  ): Promise<{ data: UserEntity[]; total: number }> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { userType: UserTypeEnum.STUDENT };
    if (search) {
      where.firstName = search; // adjust if ILike needed
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

  // ── List My Students ──────────────────────────────────────────────────────
  async findMyStudents(
    userId: number,
    query: PaginationRequest,
  ): Promise<{ data: UserEntity[]; total: number }> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userType: UserTypeEnum.STUDENT,
      assignToId: userId,
    };

    if (search) {
      where.firstName = search;
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

  // ── Single ────────────────────────────────────────────────────────────────
  async findOne(id: number): Promise<UserEntity> {
    const student = await this.userRepo.findOne({
      where: { id },
      relations: this.relations,
    });

    if (!student || student.userType !== UserTypeEnum.STUDENT) {
      throw new NotFoundException(
        this.i18n.t('errors.USER_NOT_FOUND', { lang: getLang() }),
      );
    }

    return student;
  }

  // ── Create ────────────────────────────────────────────────────────────────
  async create(dto: CreateStudentRequest): Promise<UserEntity> {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException(
        this.i18n.t('errors.EMAIL_TAKEN', { lang: getLang() }),
      );
    }

    if (dto.phone) {
      const phoneExists = await this.userRepo.findOne({ where: { phone: dto.phone } });
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
    });

    const saved = await this.userRepo.save(student);

    return this.findOne(saved.id);
  }

  // ── Update ────────────────────────────────────────────────────────────────
  async update(
    id: number,
    dto: UpdateStudentRequest,
  ): Promise<UserEntity> {
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
      const phoneExists = await this.userRepo.findOne({ where: { phone: dto.phone } });
      if (phoneExists) {
        throw new ConflictException(
          this.i18n.t('errors.PHONE_TAKEN', { lang: getLang() }),
        );
      }
    }

    if (dto.sourceId !== undefined) {
      await this.ensureSourceExists(dto.sourceId);
    }

    Object.assign(student, dto);
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
      throw new NotFoundException(this.i18n.t('errors.USER_NOT_FOUND', { lang: getLang() }));
    }

    student.assignToId = dto.assignToId;
    student.assignAt = new Date();

    await this.userRepo.save(student);

    // Update all existing orders for this student to be assigned to this staff member
    await this.ordersRepository.update(
      { studentId },
      { assignToId: dto.assignToId }
    );

    return this.findOne(studentId);
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.userRepo.remove(student);
  }
}
