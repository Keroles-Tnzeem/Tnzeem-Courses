import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { JwtPayload } from '../../shared/auth/services/jwt.service';

/**
 * Fine-grained RBAC guard for dashboard routes (admin / support / sales).
 *
 * Reads required permissions from @Permissions() decorator metadata,
 * then checks them against the permissions array embedded in the JWT payload.
 * If no @Permissions() is declared on the handler/controller, the guard passes.
 *
 * Must always be used AFTER JwtAuthGuard (which populates request.user).
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, PermissionsGuard)
 *   @Permissions('leads.view', 'leads.assign')
 *   findAll() { ... }
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // No @Permissions() declared — route is accessible to any authenticated user
        if (!required?.length) return true;

        const user = context.switchToHttp().getRequest<{ user: JwtPayload }>().user;
        const userPermissions: string[] = user?.permissions ?? [];        

        const hasAll = required.every((p) => userPermissions.includes(p));

        if (!hasAll) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
