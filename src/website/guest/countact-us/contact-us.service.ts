import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {UserEntity} from "../../../shared/user/entities/user.entity";
import {OrdersService} from "../../../staff-dashboard/orders/orders.service";
import {OrderResponse} from "../../../staff-dashboard/orders/dto/responses/order.response";
import {CreateGuestOrderRequest} from "./dto/requests/create-guest-order.request";
import {PaymentMethodEnum} from "../../../shared/payment/enums/payment-method.enum";
import {PaymentStatusEnum} from "../../../shared/payment/enums/payment-status.enum";
import {OrderStatusEnum} from "../../../shared/orders/enums/order-status.enum";
import {OrderCreatorTypeEnum} from "../../../shared/orders/enums/order-creator-type.enum";
import {normalizeSaudiPhone} from "../../../common/validators/saudi-phone.validator";
import {UserTypeEnum} from "../../../shared/user/enums/user-type.enum";

@Injectable()
export class ContactUsService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly ordersService: OrdersService,
    ) {}

    async createGuestOrder(dto: CreateGuestOrderRequest): Promise<OrderResponse> {
        const student = await this.findOrCreateStudent(dto);

        return this.ordersService.create(
            {
                studentId: student.id,
                roundId: dto.roundId,
                paymentMethod: PaymentMethodEnum.CASH,
                paymentStatus: PaymentStatusEnum.PENDING,
                status: OrderStatusEnum.PENDING,
                createdBy: OrderCreatorTypeEnum.STUDENT,
                notes: dto.notes,
            } as any,
            student.id,
        );
    }

    private async findOrCreateStudent(dto: CreateGuestOrderRequest): Promise<UserEntity> {
        const phone = normalizeSaudiPhone(dto.phone);

        const existing = await this.userRepository.findOne({ where: { phone } });
        if (existing) {
            return existing;
        }

        const randomPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const newStudent = this.userRepository.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone,
            gender: dto.gender,
            userType: UserTypeEnum.STUDENT,
            password: hashedPassword,
        });

        return this.userRepository.save(newStudent);
    }
}