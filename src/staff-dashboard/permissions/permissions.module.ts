import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from '../../shared/user/entities/permission.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PermissionEntity])],
    controllers: [PermissionsController],
    providers: [PermissionsService],
})
export class PermissionsModule {}
