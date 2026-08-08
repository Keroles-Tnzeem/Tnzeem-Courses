import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderEntity } from '../../../../shared/orders/entities/order.entity';
import { OrderStatusEnum } from '../../../../shared/orders/enums/order-status.enum';
import { OrderCreatorTypeEnum } from '../../../../shared/orders/enums/order-creator-type.enum';
import { PaymentMethodEnum } from '../../../../shared/payment/enums/payment-method.enum';
import { PaymentStatusEnum } from '../../../../shared/payment/enums/payment-status.enum';
import { PaymentTypeEnum } from '../../../../shared/payment/enums/payment-type.enum';

export class OrderResponse {
    @ApiProperty()
    id: string;

    @ApiProperty()
    studentId: number;

    @ApiProperty()
    roundId: number;

    @ApiProperty()
    courseId: number;

    @ApiProperty()
    trainerId: number;

    @ApiProperty()
    mainPrice: number;

    @ApiProperty()
    priceAfterDiscount: number;

    @ApiProperty()
    finalPrice: number;

    @ApiProperty({ enum: OrderStatusEnum })
    status: OrderStatusEnum;

    @ApiPropertyOptional({ enum: PaymentTypeEnum })
    paymentType?: PaymentTypeEnum;

    @ApiPropertyOptional({ enum: PaymentMethodEnum })
    paymentMethod?: PaymentMethodEnum;

    @ApiPropertyOptional({ enum: PaymentStatusEnum })
    paymentStatus?: PaymentStatusEnum;

    @ApiPropertyOptional()
    paymentReference?: string;

    @ApiPropertyOptional()
    paymentNotes?: string;

    @ApiPropertyOptional()
    paidAt?: Date;

    @ApiPropertyOptional()
    transferBankImg?: string;

    @ApiProperty({ enum: OrderCreatorTypeEnum })
    createdBy: OrderCreatorTypeEnum;

    @ApiPropertyOptional()
    createdById?: number;

    @ApiPropertyOptional()
    assignToId?: number;

    @ApiPropertyOptional()
    notes?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'Student basic info' })
    student?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };

    @ApiPropertyOptional({ description: 'Trainer basic info' })
    trainer?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };

    @ApiPropertyOptional({ description: 'Round basic info' })
    round?: {
        id: number;
        startDate?: Date;
        endDate?: Date;
    };

    @ApiPropertyOptional({ description: 'Course basic info' })
    course?: {
        id: number;
        name: string;
    };

    static fromEntity(entity: OrderEntity, lang: string = 'en'): OrderResponse {
        const response = new OrderResponse();
        response.id = entity.id;
        response.studentId = entity.studentId;
        response.roundId = entity.roundId;
        response.courseId = entity.courseId;
        response.trainerId = entity.trainerId;
        response.mainPrice = Number(entity.mainPrice);
        response.priceAfterDiscount = Number(entity.priceAfterDiscount);
        response.finalPrice = Number(entity.finalPrice);
        response.status = entity.status;
        response.paymentType = entity.paymentType;
        response.paymentMethod = entity.paymentMethod;
        response.paymentStatus = entity.paymentStatus;
        response.paymentReference = entity.paymentReference;
        response.paymentNotes = entity.paymentNotes;
        response.paidAt = entity.paidAt;
        response.transferBankImg = entity.transferBankImg;
        response.createdBy = entity.createdBy;
        response.createdById = entity.createdById;
        response.assignToId = entity.assignToId;
        response.notes = entity.notes;
        response.createdAt = entity.createdAt;
        response.updatedAt = entity.updatedAt;

        if (entity.student) {
            response.student = {
                id: entity.student.id,
                firstName: entity.student.firstName,
                lastName: entity.student.lastName,
                email: entity.student.email,
                phone: entity.student.phone,
            };
        }

        if (entity.trainer) {
            response.trainer = {
                id: entity.trainer.id,
                firstName: entity.trainer.firstName,
                lastName: entity.trainer.lastName,
                email: entity.trainer.email,
            };
        }

        if (entity.round) {
            response.round = {
                id: entity.round.id,
                startDate: entity.round.startDate,
                endDate: entity.round.endDate,
            };
        }

        if (entity.course) {
            response.course = {
                id: entity.course.id,
                name: entity.course.name?.[lang] || entity.course.name?.en || '',
            };
        }

        return response;
    }
}
