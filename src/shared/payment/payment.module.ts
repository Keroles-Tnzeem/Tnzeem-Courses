import { Module, forwardRef } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { PaymentStrategyFactory } from './factories/payment-strategy.factory';
import { CashPaymentStrategy } from './strategies/cash-payment.strategy';
import { BankTransferPaymentStrategy } from './strategies/bank-transfer-payment.strategy';
import { PaymentService } from './services/payment.service';

@Module({
    imports: [
        forwardRef(() => OrdersModule), // To access OrdersRepository
    ],
    providers: [
        // Strategies
        CashPaymentStrategy,
        BankTransferPaymentStrategy,
        
        // Factory
        PaymentStrategyFactory,
        
        // Service
        PaymentService,
    ],
    exports: [
        PaymentService,
    ],
})
export class PaymentModule {}
