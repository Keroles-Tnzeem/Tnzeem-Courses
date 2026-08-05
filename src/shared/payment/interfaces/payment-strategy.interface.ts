import { OrderEntity } from '../../orders/entities/order.entity';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { CreatePaymentDto } from '../dto/create-payment.dto';

export interface PaymentStrategy {
    /**
     * Checks if the strategy supports the given payment method.
     */
    supports(method: PaymentMethodEnum): boolean;

    /**
     * Validates and applies payment logic to the order.
     * Must return the updated OrderEntity.
     * Persistence is handled by the calling PaymentService.
     */
    processPayment(order: OrderEntity, dto: CreatePaymentDto): Promise<OrderEntity>;
}
