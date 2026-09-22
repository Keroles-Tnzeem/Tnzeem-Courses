import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { IdempotencyStatusEnum } from '../enums/idempotency-status.enum';

/**
 * Database-level idempotency lock/record.
 *
 * The client generates a key (UUID) per logical request and sends it in the
 * `Idempotency-Key` header. The (key, scope) pair is unique, so a concurrent
 * or repeated request with the same key for the same route:
 *  - while the first request is still processing -> rejected (409, retry later).
 *  - after the first request completed -> replayed (the stored response, no
 *    side effects re-run).
 * A failed request removes its row so the same key can be retried.
 */
@Entity('idempotency_keys')
@Index('UQ_idempotency_key_scope', ['key', 'scope'], { unique: true })
export class IdempotencyKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  key: string;

  /** Identifies the protected operation, e.g. 'student-orders.create' */
  @Column({ type: 'varchar', length: 150 })
  scope: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @Column({
    type: 'enum',
    enum: IdempotencyStatusEnum,
    default: IdempotencyStatusEnum.PROCESSING,
  })
  status: IdempotencyStatusEnum;

  @Column({ name: 'response_status_code', nullable: true })
  responseStatusCode?: number;

  @Column({ name: 'response_body', type: 'jsonb', nullable: true })
  responseBody?: any;

  @Column(() => AuditColumns, { prefix: false })
  audit: AuditColumns;
}
