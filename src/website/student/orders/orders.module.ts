import { Module } from '@nestjs/common';
import { OrdersModule as SharedOrdersModule } from '../../../shared/orders/orders.module';
import { StudentOrdersService } from './orders.service';
import { StudentOrdersController } from './orders.controller';

@Module({
  imports: [SharedOrdersModule],
  controllers: [StudentOrdersController],
  providers: [StudentOrdersService],
})
export class StudentOrdersModule {}
