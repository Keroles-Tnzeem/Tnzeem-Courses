import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { UserDataResponse } from './dto/responses/user-data.response';
import { UserTypeEnum } from './enums/user-type.enum';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly configService: ConfigService,
    ) {}

    private get appUrl(): string {
        return this.configService.get<string>('app.url', 'http://localhost:3000');
    }

    private buildImgUrl(img: string | null): string {
        const path = img || '/images/empty-user.jpeg';
        if (path.startsWith('http')) return path;
        return `${this.appUrl}${path}`;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findOne({
            where: { email },
            relations: {
                userPermissions: {
                    permission: true
                }
            }
        });
    }

    async findById(id: number): Promise<UserEntity | null> {
        return this.userRepository.findOne({
            where: { id },
            relations: {
                userPermissions: {
                    permission: true
                }
            }
        });
    }

    async validatePassword(user: UserEntity, pass: string): Promise<boolean> {
        return bcrypt.compare(pass, user.password);
    }

    getPermissions(user: UserEntity): string[] {
        if (!user.userPermissions) {
            return [];
        }
        return user.userPermissions.map(up => up.permission.name);
    }

    toUserDataResponse(user: UserEntity): UserDataResponse {
        const base = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            img: this.buildImgUrl(user.img),
            userType: user.userType,
        };

        if (
            user.userType === UserTypeEnum.ADMIN ||
            user.userType === UserTypeEnum.SUPPORT ||
            user.userType === UserTypeEnum.SALES
        ) {
            return {
                ...base,
                permissions: this.getPermissions(user)
            };
        }

        return base;
    }
}