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
import { UserPermissionEntity } from '../../shared/user/entities/user-permission.entity';
import { PermissionEntity } from '../../shared/user/entities/permission.entity';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';
import { CreateStaffRequest } from './dto/requests/create-staff.request';
import { UpdateStaffRequest } from './dto/requests/update-staff.request';

const STAFF_TYPES = [UserTypeEnum.SALES, UserTypeEnum.SUPPORT];

@Injectable()
export class StaffService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(UserPermissionEntity)
        private readonly userPermissionRepo: Repository<UserPermissionEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permissionRepo: Repository<PermissionEntity>,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    // ── List ─────────────────────────────────────────────────────────────────
    async findAll(): Promise<UserEntity[]> {
        return this.userRepo.find({
            where: [{ userType: UserTypeEnum.SALES }, { userType: UserTypeEnum.SUPPORT }],
            relations: { userPermissions: { permission: true } },
            order: { id: 'DESC' },
        });
    }

    // ── Single ────────────────────────────────────────────────────────────────
    async findOne(id: number): Promise<UserEntity> {
        const staff = await this.userRepo.findOne({
            where: { id },
            relations: { userPermissions: { permission: true } },
        });

        if (!staff || !STAFF_TYPES.includes(staff.userType)) {
            throw new NotFoundException(
                this.i18n.t('errors.USER_NOT_FOUND', { lang: this.lang() }),
            );
        }

        return staff;
    }

    // ── Create ────────────────────────────────────────────────────────────────
    async create(dto: CreateStaffRequest): Promise<UserEntity> {
        const exists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exists) {
            throw new ConflictException(
                this.i18n.t('errors.EMAIL_TAKEN', { lang: this.lang() }),
            );
        }

        const hashed = await bcrypt.hash(dto.password, 10);

        const staff = this.userRepo.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            password: hashed,
            userType: dto.userType,
        });

        const saved = await this.userRepo.save(staff);

        if (dto.permissionIds?.length) {
            await this.syncPermissions(saved, dto.permissionIds);
        }

        return this.findOne(saved.id);
    }

    // ── Update ────────────────────────────────────────────────────────────────
    async update(id: number, dto: UpdateStaffRequest): Promise<UserEntity> {
        const staff = await this.findOne(id);

        if (dto.email && dto.email !== staff.email) {
            const exists = await this.userRepo.findOne({ where: { email: dto.email } });
            if (exists) {
                throw new ConflictException(
                    this.i18n.t('errors.EMAIL_TAKEN', { lang: this.lang() }),
                );
            }
        }

        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        const { permissionIds, ...fields } = dto;
        Object.assign(staff, fields);
        await this.userRepo.save(staff);

        if (permissionIds !== undefined) {
            await this.syncPermissions(staff, permissionIds);
        }

        return this.findOne(id);
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    async remove(id: number): Promise<void> {
        const staff = await this.findOne(id);
        await this.userRepo.remove(staff);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private async syncPermissions(staff: UserEntity, permissionIds: number[]): Promise<void> {
        await this.userPermissionRepo.delete({ user: { id: staff.id } });

        if (!permissionIds.length) return;

        const permissions = await this.permissionRepo.findBy({ id: In(permissionIds) });
        const entries = permissions.map((permission) =>
            this.userPermissionRepo.create({ user: staff, permission }),
        );

        await this.userPermissionRepo.save(entries);
    }
}
