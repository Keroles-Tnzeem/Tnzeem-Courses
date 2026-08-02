import {UserTypeEnum} from "../../user/enums/user-type.enum";
import {Injectable} from "@nestjs/common";
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
    sub: number;
    userType: UserTypeEnum;
    permissions?: string[];
}

@Injectable()
export class JwtTokenService {
    constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigService
    ) {}

    generateAccessToken(payload: JwtPayload): { accessToken: string, expiresIn: number } {
        const accessToken = this.jwtService.sign(payload);

        const decoded = this.jwtService.decode(accessToken) as { iat: number; exp: number };
        const expiresIn = decoded.exp - decoded.iat;

        return { accessToken, expiresIn };
    }


    async verifyAccessToken(token: string): Promise<JwtPayload> {
        return this.jwtService.verifyAsync<JwtPayload>(token);
    }

    generateRefreshToken(payload: JwtPayload): string {
        return this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET')?.trim(),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')?.trim() as any,
        });
    }

    async verifyRefreshToken(token: string): Promise<JwtPayload> {
        return this.jwtService.verifyAsync<JwtPayload>(token, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
    }

    decode(token: string): JwtPayload | null {
        return this.jwtService.decode<JwtPayload>(token);
    }
}