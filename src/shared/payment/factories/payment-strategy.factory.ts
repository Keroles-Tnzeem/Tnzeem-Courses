import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { CashPaymentStrategy } from '../strategies/cash-payment.strategy';
import { BankTransferPaymentStrategy } from '../strategies/bank-transfer-payment.strategy';

@Injectable()
export class PaymentStrategyFactory {
    private strategies: PaymentStrategy[];

    constructor(
        private readonly cashStrategy: CashPaymentStrategy,
        private readonly bankTransferStrategy: BankTransferPaymentStrategy,
    ) {
        // Register all strategies here
        this.strategies = [
            this.cashStrategy,
            this.bankTransferStrategy,
            // Future strategies (Tabby, Tamara, etc.) will be added here
        ];
    }

    /**
     * Resolves the correct payment strategy based on the requested method.
     * Throws BadRequestException if no strategy supports the method.
     */
    getStrategy(method: PaymentMethodEnum): PaymentStrategy {
        const strategy = this.strategies.find(s => s.supports(method));
        if (!strategy) {
            throw new BadRequestException(`No payment strategy found for method: ${method}`);
        }
        return strategy;
    }
}
