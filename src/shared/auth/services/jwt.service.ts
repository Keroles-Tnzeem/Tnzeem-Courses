import {UserTypeEnum} from "../../user/enums/user-type.enum";
import {Injectable} from "@nestjs/common";
import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface JwtPayload {
    sub: number;
    userType: UserTypeEnum;
    permissions?: string[];
}

@Injectable()
export class JwtTokenService {
    constructor(private readonly jwtService: NestJwtService) {}

    generateAccessToken(payload: JwtPayload): { accessToken: string, expiresIn: number } {
        const accessToken = this.jwtService.sign(payload);

        const decoded = this.jwtService.decode(accessToken) as { iat: number; exp: number };
        const expiresIn = decoded.exp - decoded.iat;

        return { accessToken, expiresIn };
    }


    async verifyAccessToken(token: string): Promise<JwtPayload> {
        return this.jwtService.verifyAsync<JwtPayload>(token);
    }

    decode(token: string): JwtPayload | null {
        return this.jwtService.decode<JwtPayload>(token);
    }
}