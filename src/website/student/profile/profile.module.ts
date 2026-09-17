import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/user/entities/user.entity';
import { StorageModule } from '../../../shared/storage/storage.module';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), StorageModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class StudentProfileModule {}
