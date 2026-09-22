import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { IdempotencyKeyEntity } from './entities/idempotency-key.entity';
import { IdempotencyStatusEnum } from './enums/idempotency-status.enum';

/** Postgres unique_violation error code. */
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectRepository(IdempotencyKeyEntity)
    private readonly repo: Repository<IdempotencyKeyEntity>,
  ) {}

  /**
   * Every method takes an optional `manager`: pass the transaction's
   * EntityManager (e.g. from `dataSource.transaction(async (manager) => ...)`)
   * so the lock row is committed/rolled back atomically with the business
   * writes it's guarding — a failed handler then needs no explicit cleanup,
   * the rollback removes the PROCESSING row for free.
   */
  private repoFor(manager?: EntityManager): Repository<IdempotencyKeyEntity> {
    return manager ? manager.getRepository(IdempotencyKeyEntity) : this.repo;
  }

  /**
   * Atomically claims (key, scope): if no row exists yet, inserts one with
   * status PROCESSING (the DB unique index is the actual lock — a race
   * between two concurrent requests with the same key resolves to a single
   * winner, the loser gets the unique-violation error and re-reads the row).
   * Returns the existing/created row and whether the caller won the lock.
   */
  async acquire(
    key: string,
    scope: string,
    userId?: number,
    manager?: EntityManager,
  ): Promise<{ record: IdempotencyKeyEntity; acquired: boolean }> {
    const repo = this.repoFor(manager);
    const existing = await repo.findOne({ where: { key, scope } });
    if (existing) return { record: existing, acquired: false };

    try {
      const created = await repo.save(
        repo.create({
          key,
          scope,
          userId,
          status: IdempotencyStatusEnum.PROCESSING,
        }),
      );
      return { record: created, acquired: true };
    } catch (error) {
      if (error?.code === UNIQUE_VIOLATION) {
        const record = await repo.findOneOrFail({ where: { key, scope } });
        return { record, acquired: false };
      }
      throw error;
    }
  }

  async complete(
    id: string,
    responseStatusCode: number,
    responseBody: any,
    manager?: EntityManager,
  ): Promise<void> {
    await this.repoFor(manager).update(id, {
      status: IdempotencyStatusEnum.COMPLETED,
      responseStatusCode,
      responseBody,
    });
  }

  /** The handler failed: drop the lock so the same key can be retried. */
  async release(id: string, manager?: EntityManager): Promise<void> {
    await this.repoFor(manager).delete(id);
  }
}
