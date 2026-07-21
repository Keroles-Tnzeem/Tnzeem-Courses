import {
    CanActivate,
    ExecutionContext,
    Injectable, UnauthorizedException
} from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../services/jwt.service';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {

    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request & { user?: any }>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Missing bearer token');
        }

        try {
            // Verifies signature + expiry using the same secret configured in JwtModule.
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
            request.user = payload; // available afterwards via @CurrentUser()
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