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

    async findAll(query: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: PermissionEntity[]; total: number }> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const [data, total] = await this.permissionRepo.findAndCount({ 
            skip,
            take: limit,
            order: { module: 'ASC', name: 'ASC' }
        });
        
        return { data, total };
    }
}
