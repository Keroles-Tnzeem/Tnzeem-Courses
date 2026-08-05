import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentStrategyFactory } from '../factories/payment-strategy.factory';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentStatusDto } from '../dto/update-payment-status.dto';
import { OrderEntity } from '../../orders/entities/order.entity';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { OrderStatusEnum } from '../../orders/enums/order-status.enum';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { PaymentTypeEnum } from '../enums/payment-type.enum';

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentStrategyFactory: PaymentStrategyFactory,
        private readonly ordersRepository: OrdersRepository,
    ) {}

    /**
     * Processes a new payment for an order using the strategy resolved from the factory.
     */
    async processPayment(dto: CreatePaymentDto): Promise<OrderEntity> {
        const order = await this.ordersRepository.findOne({
            where: { id: dto.orderId },
            relations: { student: true, round: true, trainer: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status === OrderStatusEnum.CANCELLED) {
            throw new BadRequestException('Cannot process payment for a cancelled order.');
        }

        if (order.paymentStatus === PaymentStatusEnum.COMPLETED) {
            throw new BadRequestException('Payment is already completed for this order.');
        }

        // Resolve the correct strategy
        const strategy = this.paymentStrategyFactory.getStrategy(dto.paymentMethod);

        // Process payment via strategy (this handles method-specific rules and mutates the order instance)
        await strategy.processPayment(order, dto);

        // Persist the updated order
        return await this.ordersRepository.save(order);
    }

    /**
     * Confirms a payment (usually called by staff for manual payments or by webhooks for online payments).
     */
    async confirmPayment(orderId: string, notes?: string): Promise<OrderEntity> {
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');

        if (order.paymentStatus === PaymentStatusEnum.COMPLETED) {
            throw new BadRequestException('Payment is already completed.');
        }

        order.paymentStatus = PaymentStatusEnum.COMPLETED;
        order.paidAt = new Date();
        
        if (notes) {
            order.paymentNotes = order.paymentNotes ? `${order.paymentNotes}\n${notes}` : notes;
        }

        // Auto-confirm the order if payment is fully confirmed
        if (order.status === OrderStatusEnum.PENDING) {
            order.status = OrderStatusEnum.CONFIRMED;
        }

        return await this.ordersRepository.save(order);
    }

    /**
     * Fails a payment (e.g., rejected bank transfer or failed online transaction).
     */
    async failPayment(orderId: string, notes?: string): Promise<OrderEntity> {
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');

        order.paymentStatus = PaymentStatusEnum.FAILED;
        
        if (notes) {
            order.paymentNotes = order.paymentNotes ? `${order.paymentNotes}\n${notes}` : notes;
        }

        return await this.ordersRepository.save(order);
    }

    /**
     * Cancels a pending payment.
     */
    async cancelPayment(orderId: string, notes?: string): Promise<OrderEntity> {
        const order = await this.ordersRepository.findOne({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');

        if (order.paymentStatus === PaymentStatusEnum.COMPLETED) {
            throw new BadRequestException('Cannot cancel a completed payment. A refund is required instead.');
        }

        order.paymentStatus = PaymentStatusEnum.CANCELLED;
        
        if (notes) {
            order.paymentNotes = order.paymentNotes ? `${order.paymentNotes}\n${notes}` : notes;
        }

        return await this.ordersRepository.save(order);
    }

    /**
     * Returns all supported payment methods.
     */
    getSupportedMethods(): PaymentMethodEnum[] {
        return Object.values(PaymentMethodEnum);
    }

    /**
     * Returns all supported payment types.
     */
    getSupportedPaymentTypes(): PaymentTypeEnum[] {
        return Object.values(PaymentTypeEnum);
    }
}
