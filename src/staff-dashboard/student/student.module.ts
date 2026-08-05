import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { SourceEntity } from '../sources/entities/source.entity';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { OrdersModule as SharedOrdersModule } from '../../shared/orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SourceEntity]),
    SharedOrdersModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}