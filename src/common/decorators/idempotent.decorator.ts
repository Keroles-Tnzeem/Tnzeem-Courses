import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENCY_SCOPE_KEY = 'idempotency_scope';

/**
 * Marks a route as requiring an `Idempotency-Key` header, enforced at the
 * database level by IdempotencyInterceptor (see `common/interceptors`).
 *
 * `scope` namespaces the key so the same key sent to two different routes
 * doesn't collide, e.g. 'student-orders.create'.
 *
 * Usage:
 *   @Idempotent('student-orders.create')
 *   @UseInterceptors(IdempotencyInterceptor)
 *   create() { ... }
 */
export const Idempotent = (scope: string) =>
  SetMetadata(IDEMPOTENCY_SCOPE_KEY, scope);
