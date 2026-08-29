import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../shared/auth/services/jwt.service';

/**
 * Extracts the trainer info from the JWT payload.
 * Should be used in routes guarded by TrainerGuard.
 *
 * Usage:
 *   @Get()
 *   getSomething(@Trainer() trainer: JwtPayload) { ... }
 */
export const Trainer = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
