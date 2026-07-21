import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../shared/auth/services/jwt.service';
import { Request } from 'express';

/**
 * Generic guard: "is this a valid logged-in user?"
 * Verifies the Bearer JWT and attaches the decoded payload to request.user.
 *
 * Use this on any route that requires authentication, regardless of role.
 * Pair with PermissionsGuard for fine-grained RBAC on dashboard routes.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @UseGuards(JwtAuthGuard, PermissionsGuard)
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Missing bearer token');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
            request.user = payload; // accessible via @CurrentUser()
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
