import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { TrainerInfoEntity } from '../../shared/user/entities/trainer-info.entity';
import { TrainerController } from './trainer.controller';
import { TrainerService } from './trainer.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            TrainerInfoEntity,
        ]),
    ],
    controllers: [TrainerController],
    providers: [TrainerService],
})
export class TrainerModule {}
