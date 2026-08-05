import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { TrainerInfoEntity } from '../../shared/user/entities/trainer-info.entity';
import { TrainerController } from './trainer.controller';
import { TrainerService } from './trainer.service';
import { StorageModule } from '../../shared/storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            TrainerInfoEntity,
        ]),
        StorageModule,
    ],
    controllers: [TrainerController],
    providers: [TrainerService],
})
export class TrainerModule {}
