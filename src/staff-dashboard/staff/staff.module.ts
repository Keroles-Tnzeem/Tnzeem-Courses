import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { UserPermissionEntity } from '../../shared/user/entities/user-permission.entity';
import { PermissionEntity } from '../../shared/user/entities/permission.entity';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StorageModule } from '../../shared/storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, UserPermissionEntity, PermissionEntity]),
        StorageModule,
    ],
    controllers: [StaffController],
    providers: [StaffService],
})
export class StaffModule {}
