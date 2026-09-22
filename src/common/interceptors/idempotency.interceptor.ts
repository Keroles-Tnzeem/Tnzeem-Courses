import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext } from 'nestjs-i18n';
import { Observable, from, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { IDEMPOTENCY_SCOPE_KEY } from '../decorators/idempotent.decorator';
import { IdempotencyService } from '../../shared/idempotency/idempotency.service';
import { IdempotencyStatusEnum } from '../../shared/idempotency/enums/idempotency-status.enum';
import { JwtPayload } from '../../shared/auth/services/jwt.service';

/**
 * Database-level idempotency for routes annotated with @Idempotent(scope).
 *
 * Flow:
 *  1. Client sends `Idempotency-Key: <uuid>` with the request.
 *  2. We try to insert a (key, scope) row with status PROCESSING.
 *     - Row already exists & COMPLETED -> replay the stored response, the
 *       handler (and its side effects, e.g. creating an order) never runs.
 *     - Row already exists & still PROCESSING -> 409, a duplicate/concurrent
 *       request for the same key is already in flight.
 *     - No row -> we won the lock, continue to the real handler.
 *  3. Handler succeeds -> store its response body/status on the row.
 *     Handler throws -> the row is deleted so the same key can be retried.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const scope = this.reflector.getAllAndOverride<string>(
      IDEMPOTENCY_SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!scope) return next.handle();

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    const lang = I18nContext.current()?.lang;

    const key = (request.headers['idempotency-key'] ||
      request.headers['Idempotency-Key']) as string | undefined;

    if (!key) {
      const i18n = I18nContext.current();
      throw new BadRequestException(
        i18n
          ? i18n.t('errors.IDEMPOTENCY_KEY_REQUIRED', { lang })
          : 'Idempotency-Key header is required',
      );
    }

    const userId = (request.user as JwtPayload | undefined)?.sub;

    return from(this.idempotencyService.acquire(key, scope, userId)).pipe(
      switchMap(({ record, acquired }) => {
        if (!acquired) {
          if (record.status === IdempotencyStatusEnum.COMPLETED) {
            if (record.responseStatusCode) {
              response.status(record.responseStatusCode);
            }
            return of(record.responseBody);
          }

          const i18n = I18nContext.current();
          throw new ConflictException(
            i18n
              ? i18n.t('errors.IDEMPOTENCY_REQUEST_IN_PROGRESS', { lang })
              : 'A request with this idempotency key is already being processed',
          );
        }

        return next.handle().pipe(
          tap((body) => {
            void this.idempotencyService.complete(
              record.id,
              response.statusCode,
              body,
            );
          }),
          catchError((error) => {
            void this.idempotencyService.release(record.id);
            throw error;
          }),
        );
      }),
    );
  }
}
