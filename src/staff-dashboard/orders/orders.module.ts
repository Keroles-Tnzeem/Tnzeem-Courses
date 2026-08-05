import { Module } from '@nestjs/common';
import { OrdersModule as SharedOrdersModule } from '../../shared/orders/orders.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { RoundsModule } from '../rounds/rounds.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
    imports: [
        SharedOrdersModule, // provides OrdersRepository
        StorageModule,      // provides StorageService
        RoundsModule,       // provides RoundsService (round → course → price)
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class StaffOrdersModule {}
