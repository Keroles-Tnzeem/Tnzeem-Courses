import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserPermissionEntity } from './entities/user-permission.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserService } from './user.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity, 
            PermissionEntity, 
            UserPermissionEntity
        ])
    ],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
