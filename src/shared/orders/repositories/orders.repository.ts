import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { OrderStatusEnum } from '../enums/order-status.enum';

/**
 * OrdersRepository wraps TypeORM's Repository<OrderEntity> and adds
 * domain-specific query methods used across different feature modules.
 */
@Injectable()
export class OrdersRepository {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly repo: Repository<OrderEntity>,
    ) {}

    /** Find all orders for a specific student, newest first. */
    findByStudent(studentId: number): Promise<OrderEntity[]> {
        return this.repo.find({
            where: { studentId },
            relations: { round: true, trainer: true },
            order: { audit: { createdAt: 'DESC' } },
        });
    }

    /** Find all orders for a specific round. */
    findByRound(roundId: number): Promise<OrderEntity[]> {
        return this.repo.find({
            where: { roundId },
            relations: { student: true, trainer: true },
            order: { audit: { createdAt: 'DESC' } },
        });
    }

    /** Find all orders assigned to a specific trainer. */
    findByTrainer(trainerId: number): Promise<OrderEntity[]> {
        return this.repo.find({
            where: { trainerId },
            relations: { student: true, round: true },
            order: { audit: { createdAt: 'DESC' } },
        });
    }

    /** Find all orders currently in PENDING status. */
    findPending(): Promise<OrderEntity[]> {
        return this.repo.find({
            where: { status: OrderStatusEnum.PENDING },
            relations: { student: true, round: true, trainer: true },
            order: { audit: { createdAt: 'ASC' } },
        });
    }

    /**
     * Check whether a non-cancelled order already exists for this
     * student + round combination (used for duplicate prevention).
     */
    async hasActiveOrder(studentId: number, roundId: number): Promise<boolean> {
        const count = await this.repo.count({
            where: [
                { studentId, roundId, status: OrderStatusEnum.PENDING },
                { studentId, roundId, status: OrderStatusEnum.CONFIRMED },
            ],
        });
        return count > 0;
    }

    /** Delegate standard repository methods. */
    create(data: Partial<OrderEntity>): OrderEntity {
        return this.repo.create(data);
    }

    save(entity: OrderEntity): Promise<OrderEntity> {
        return this.repo.save(entity);
    }

    findOne(options: Parameters<Repository<OrderEntity>['findOne']>[0]): Promise<OrderEntity | null> {
        return this.repo.findOne(options);
    }

    remove(entity: OrderEntity): Promise<OrderEntity> {
        return this.repo.remove(entity);
    }

    update(criteria: Parameters<Repository<OrderEntity>['update']>[0], partialEntity: Parameters<Repository<OrderEntity>['update']>[1]) {
        return this.repo.update(criteria, partialEntity);
    }

    createQueryBuilder(alias: string) {
        return this.repo.createQueryBuilder(alias);
    }
}
