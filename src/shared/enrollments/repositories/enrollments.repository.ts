import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from '../entities/enrollment.entity';
import { EnrollmentStatusEnum } from '../enums/enrollment-status.enum';


@Injectable()
export class EnrollmentsRepository {
    constructor(
        @InjectRepository(EnrollmentEntity)
        private readonly repo: Repository<EnrollmentEntity>,
    ) {}

    /** Find all enrollments for a specific student, newest first. */
    findByStudent(studentId: number): Promise<EnrollmentEntity[]> {
        return this.repo.find({
            where: { studentId },
            relations: { round: true, order: true },
            order: { audit: { createdAt: 'DESC' } },
        });
    }

    /** Find all enrollments for a specific round. */
    findByRound(roundId: number): Promise<EnrollmentEntity[]> {
        return this.repo.find({
            where: { roundId },
            relations: { student: true },
            order: { audit: { createdAt: 'DESC' } },
        });
    }

    /** Find all active enrollments for a specific round. */
    findActiveByRound(roundId: number): Promise<EnrollmentEntity[]> {
        return this.repo.find({
            where: { roundId, status: EnrollmentStatusEnum.ACTIVE },
            relations: { student: true },
            order: { audit: { createdAt: 'DESC' } },
        });
    }

    /**
     * Check whether an enrollment already exists for this
     * student + round combination (used for duplicate prevention).
     */
    async exists(studentId: number, roundId: number): Promise<boolean> {
        const count = await this.repo.count({ where: { studentId, roundId } });
        return count > 0;
    }

    /** Delegate standard repository methods. */
    create(data: Partial<EnrollmentEntity>): EnrollmentEntity {
        return this.repo.create(data);
    }

    save(entity: EnrollmentEntity): Promise<EnrollmentEntity> {
        return this.repo.save(entity);
    }

    findOne(options: Parameters<Repository<EnrollmentEntity>['findOne']>[0]): Promise<EnrollmentEntity | null> {
        return this.repo.findOne(options);
    }

    remove(entity: EnrollmentEntity): Promise<EnrollmentEntity> {
        return this.repo.remove(entity);
    }

    update(
        criteria: Parameters<Repository<EnrollmentEntity>['update']>[0],
        partialEntity: Parameters<Repository<EnrollmentEntity>['update']>[1],
    ) {
        return this.repo.update(criteria, partialEntity);
    }

    createQueryBuilder(alias: string) {
        return this.repo.createQueryBuilder(alias);
    }

    findAndCount(options: Parameters<Repository<EnrollmentEntity>['findAndCount']>[0]): Promise<[EnrollmentEntity[], number]> {
        return this.repo.findAndCount(options);
    }
}
