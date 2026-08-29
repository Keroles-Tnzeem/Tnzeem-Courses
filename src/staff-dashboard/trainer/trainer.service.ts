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
import { TrainerInfoEntity } from '../../shared/user/entities/trainer-info.entity';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';
import { CreateTrainerRequest } from './dto/requests/create-trainer.request';
import { UpdateTrainerRequest } from './dto/requests/update-trainer.request';
import {getLang} from "../../common/helpers/lang.helper";

@Injectable()
export class TrainerService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(TrainerInfoEntity)
        private readonly trainerInfoRepo: Repository<TrainerInfoEntity>,
        private readonly i18n: I18nService,
    ) {}



    async findAll(query: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: UserEntity[]; total: number }> {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const [data, total] = await this.userRepo.findAndCount({
            where: { userType: UserTypeEnum.TRAINER },
            relations: { trainerInfo: true },
            skip,
            take: limit,
            order: { id: 'DESC' },
        });

        return { data, total };
    }

    async findOne(id: number): Promise<UserEntity> {
        const trainer = await this.userRepo.findOne({
            where: { id },
            relations: { trainerInfo: true },
        });

        if (!trainer || trainer.userType !== UserTypeEnum.TRAINER) {
            throw new NotFoundException(
                this.i18n.t('errors.USER_NOT_FOUND', { lang: getLang() }),
            );
        }

        return trainer;
    }

    async create(dto: CreateTrainerRequest, img?: string): Promise<UserEntity> {
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

        const password = dto.password || Math.random().toString(36).slice(-10);
        const hashed = await bcrypt.hash(password, 10);

        const trainerInfo = this.trainerInfoRepo.create({
            age: dto.age,
            numExperience: dto.numExperience,
            experience: dto.experience,
            numCourses: dto.numCourses ?? 0,
        });

        const trainer = this.userRepo.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            gender: dto.gender,
            img: img,
            password: hashed,
            userType: UserTypeEnum.TRAINER,
            trainerInfo: trainerInfo,
        });

        const saved = await this.userRepo.save(trainer);

        return this.findOne(saved.id);
    }

    async update(id: number, dto: UpdateTrainerRequest, img?: string): Promise<UserEntity> {
        const trainer = await this.findOne(id);

        if (dto.email && dto.email !== trainer.email) {
            const exists = await this.userRepo.findOne({ where: { email: dto.email } });
            if (exists) {
                throw new ConflictException(
                    this.i18n.t('errors.EMAIL_TAKEN', { lang: getLang() }),
                );
            }
        }

        if (dto.phone && dto.phone !== trainer.phone) {
            const phoneExists = await this.userRepo.findOne({ where: { phone: dto.phone } });
            if (phoneExists) {
                throw new ConflictException(
                    this.i18n.t('errors.PHONE_TAKEN', { lang: getLang() }),
                );
            }
        }

        const { age, numExperience, experience, numCourses, password, ...userFields } = dto;
        
        Object.assign(trainer, userFields);

        if (password) {
            trainer.password = await bcrypt.hash(password, 10);
        }

        if (img) {
            trainer.img = img;
        }

        if (age !== undefined || numExperience !== undefined || experience !== undefined || numCourses !== undefined) {
            if (!trainer.trainerInfo) {
                trainer.trainerInfo = this.trainerInfoRepo.create();
            }
            if (age !== undefined) trainer.trainerInfo.age = age;
            if (numExperience !== undefined) trainer.trainerInfo.numExperience = numExperience;
            if (experience !== undefined) trainer.trainerInfo.experience = experience;
            if (numCourses !== undefined) trainer.trainerInfo.numCourses = numCourses;
        }

        await this.userRepo.save(trainer);

        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const trainer = await this.findOne(id);
        await this.userRepo.remove(trainer);
    }
}
