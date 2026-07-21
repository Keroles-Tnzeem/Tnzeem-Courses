import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UserTypeEnum} from "../../user/enums/user-type.enum";
import {UserService} from "../../user/user.service";
import {JwtPayload, JwtTokenService} from "./jwt.service";
import {LoginResponse} from "../dto/responses/login.response";
import {LoginRequest} from "../dto/requests/login.request";
import { I18nService, I18nContext } from 'nestjs-i18n';

const STAFF_TYPES = [UserTypeEnum.ADMIN, UserTypeEnum.SALES];

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly i18n: I18nService
    ) {}

    async login(dto: LoginRequest): Promise<LoginResponse> {
        const user = await this.userService.findByEmail(dto.email);

        if (!user) {
            throw new UnauthorizedException(this.i18n.t('errors.INVALID_CREDENTIALS', { lang: I18nContext.current()?.lang }));
        }

        const passwordMatches =
            await this.userService.validatePassword(
                user,
                dto.password,
            );

        if (!passwordMatches) {
            throw new UnauthorizedException(this.i18n.t('errors.INVALID_CREDENTIALS', { lang: I18nContext.current()?.lang }));
        }

        const payload = {
            sub: user.id,
            userType: user.userType,
            permissions: this.userService.getPermissions(user),
        };

        const { accessToken, expiresIn } =
            this.jwtTokenService.generateAccessToken(payload);

        return {
            accessToken,
            expireIn: expiresIn,
            user: this.userService.toUserDataResponse(user),
        };
    }
}