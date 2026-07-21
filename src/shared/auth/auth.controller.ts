import {Body, Controller, Post} from "@nestjs/common";
import {AuthService} from "./services/auth.service";
import {LoginRequest} from "./dto/requests/login.request";
import {LoginResponse} from "./dto/responses/login.response";
import {ApiResponseDto} from "../../common/dto/responses/api.response";
import { I18nService, I18nContext } from 'nestjs-i18n';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly i18n: I18nService
    ) {}

    @Post('login')
    async login(
        @Body() request: LoginRequest
    ): Promise<ApiResponseDto<LoginResponse>> {
        const response = await this.authService.login(request);
        return ApiResponseDto.success(
            response, 
            this.i18n.t('common.success', { lang: I18nContext.current()?.lang })
        );
    }

}