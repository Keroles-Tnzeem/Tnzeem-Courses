import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { UserDataResponse } from './dto/responses/user-data.response';
import { UserTypeEnum } from './enums/user-type.enum';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

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