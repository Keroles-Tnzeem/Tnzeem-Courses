import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { UserEntity } from "../../../shared/user/entities/user.entity";
import { OrdersService } from "../../../staff-dashboard/orders/orders.service";
import { OrderResponse } from "../../../staff-dashboard/orders/dto/responses/order.response";
import { getLang } from "../../../common/helpers/lang.helper";
import { CreateGuestOrderRequest } from "./dto/requests/create-guest-order.request";
import { PaymentMethodEnum } from "../../../shared/payment/enums/payment-method.enum";
import { PaymentStatusEnum } from "../../../shared/payment/enums/payment-status.enum";
import { OrderStatusEnum } from "../../../shared/orders/enums/order-status.enum";
import { OrderCreatorTypeEnum } from "../../../shared/orders/enums/order-creator-type.enum";
import { normalizeSaudiPhone } from "../../../common/validators/saudi-phone.validator";
import { UserTypeEnum } from "../../../shared/user/enums/user-type.enum";
import { SourcesService } from "../../../staff-dashboard/sources/sources.service";

@Injectable()
export class ContactUsService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly ordersService: OrdersService,
        private readonly sourcesService: SourcesService,
        private readonly i18n: I18nService,
    ) { }

    async createGuestOrder(dto: CreateGuestOrderRequest): Promise<OrderResponse> {
        const student = await this.findOrCreateStudent(dto);

        return this.ordersService.create(
            {
                studentId: student.id,
                roundId: undefined,
                courseId: dto.courseId,
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

        // Look up any student that shares this phone OR this email
        const existing = await this.userRepository.findOne({
            where: [
                { phone },
                { email: dto.email },
            ],
        });

        if (existing) {
            const phoneMatch = existing.phone === phone;
            const emailMatch = existing.email === dto.email;

            if (phoneMatch && emailMatch) {
                // Same student — proceed
                return existing;
            }

            if (phoneMatch && !emailMatch) {
                throw new ConflictException(
                    this.i18n.t('errors.PHONE_TAKEN_DIFFERENT_EMAIL', { lang: getLang() }),
                );
            }

            if (emailMatch && !phoneMatch) {
                throw new ConflictException(
                    this.i18n.t('errors.EMAIL_TAKEN_DIFFERENT_PHONE', { lang: getLang() }),
                );
            }
        }

        const randomPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        let sourceId: number | undefined;
        if (dto.source) {
            const resolvedId = await this.sourcesService.findIdByName(dto.source);
            if (resolvedId !== null) {
                sourceId = resolvedId;
            }
        }

        const newStudent = this.userRepository.create({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone,
            ...(dto.gender && { gender: dto.gender }),
            userType: UserTypeEnum.STUDENT,
            password: hashedPassword,
            sourceId,
        });

        return this.userRepository.save(newStudent);
    }
}