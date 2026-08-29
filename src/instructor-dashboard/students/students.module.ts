import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorStudentsController } from './students.controller';
import { InstructorStudentsService } from './students.service';
import { OrderEntity } from '../../shared/orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
  ],
  controllers: [InstructorStudentsController],
  providers: [InstructorStudentsService],
})
export class InstructorStudentsModule {}
