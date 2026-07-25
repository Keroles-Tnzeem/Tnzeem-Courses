import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';
import { CreateStudentRequest } from './dto/requests/create-student.request';
import { UpdateStudentRequest } from './dto/requests/update-student.request';

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    // ── List ─────────────────────────────────────────────────────────────────
    async findAll(query: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: UserEntity[]; total: number }> {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;
        
        const [data, total] = await this.userRepo.findAndCount({
            where: { userType: UserTypeEnum.STUDENT },
            skip,
            take: limit,
            order: { id: 'DESC' },
        });

        return { data, total };
    }

    // ── Single ────────────────────────────────────────────────────────────────
    async findOne(id: number): Promise<UserEntity> {
        const student = await this.userRepo.findOne({
            where: { id },
        });

        if (!student || student.userType !== UserTypeEnum.STUDENT) {
            throw new NotFoundException(
                this.i18n.t('errors.USER_NOT_FOUND', { lang: this.lang() }),
            );
        }

        return student;
    }

    // ── Create ────────────────────────────────────────────────────────────────
    async create(dto: CreateStudentRequest): Promise<UserEntity> {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists) {
            throw new ConflictException(
                this.i18n.t('errors.EMAIL_TAKEN', { lang: this.lang() }),
            );
        }

        const randomDummyPassword = Math.random().toString(36).slice(-10);
        const hashed = await bcrypt.hash(randomDummyPassword, 10);

        const student = this.userRepo.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashed,
            userType: UserTypeEnum.STUDENT,
        });

        const saved = await this.userRepo.save(student);

        return this.findOne(saved.id);
    }

    // ── Update ────────────────────────────────────────────────────────────────
    async update(id: number, dto: UpdateStudentRequest): Promise<UserEntity> {
        const student = await this.findOne(id);

        if (dto.email && dto.email !== student.email) {
            const exists = await this.userRepo.findOne({ where: { email: dto.email } });
            if (exists) {
                throw new ConflictException(
                    this.i18n.t('errors.EMAIL_TAKEN', { lang: this.lang() }),
                );
            }
        }

        const { ...userFields } = dto;
        
        Object.assign(student, userFields);

        await this.userRepo.save(student);

        return this.findOne(id);
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    async remove(id: number): Promise<void> {
        const student = await this.findOne(id);
        await this.userRepo.remove(student);
    }
}
