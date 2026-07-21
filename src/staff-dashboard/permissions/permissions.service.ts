import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../../shared/user/entities/permission.entity';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepo: Repository<PermissionEntity>,
    ) {}

    findAll(): Promise<PermissionEntity[]> {
        return this.permissionRepo.find({ order: { module: 'ASC', name: 'ASC' } });
    }
}
