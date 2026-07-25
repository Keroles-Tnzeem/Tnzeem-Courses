import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
        ]),
    ],
    controllers: [StudentController],
    providers: [StudentService],
})
export class StudentModule {}
