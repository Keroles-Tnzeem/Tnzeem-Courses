import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { PaymentTypeEnum } from '../enums/payment-type.enum';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { OrderEntity } from '../../orders/entities/order.entity';

@Injectable()
export class BankTransferPaymentStrategy implements PaymentStrategy {
    supports(method: PaymentMethodEnum): boolean {
        return method === PaymentMethodEnum.BANK_TRANSFER;
    }

    async processPayment(order: OrderEntity, dto: CreatePaymentDto): Promise<OrderEntity> {
        if (!dto.referenceNumber) {
            throw new BadRequestException('Bank transfer requires a reference number.');
        }

        order.paymentType = PaymentTypeEnum.MANUAL;
        order.paymentMethod = PaymentMethodEnum.BANK_TRANSFER;
        order.paymentStatus = PaymentStatusEnum.PENDING; // Needs manual verification by staff
        order.paymentReference = dto.referenceNumber;
        order.paymentNotes = dto.notes;

        return order;
    }
}
