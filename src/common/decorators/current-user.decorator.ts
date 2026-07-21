import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../shared/auth/services/jwt.service';

/**
 * Extracts the authenticated user (JWT payload) from the request.
 *
 * Usage:
 *   findAll(@CurrentUser() user: JwtPayload) { ... }
 *   findAll(@CurrentUser('sub') userId: number) { ... }
 */
export const CurrentUser = createParamDecorator(
    (field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
        const user = request.user;
        return field ? user?.[field] : user;
    },
);
