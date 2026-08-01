import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {AuthService} from "./services/auth.service";
import {LoginRequest} from "./dto/requests/login.request";
import {LoginResponse} from "./dto/responses/login.response";
import {ApiResponseDto} from "../../common/dto/responses/api.response";
import { I18nService, I18nContext } from 'nestjs-i18n';
import {RefreshTokenRequest} from "./dto/requests/refresh-token.request";
import {TokenResponse} from "./dto/responses/token.response";
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly i18n: I18nService
    ) {}

    @Post('login')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiOperation({ summary: 'Authenticate a user and return access tokens' })
    @ApiCreatedResponse({ description: 'User authenticated successfully', type: LoginResponse })
    async login(
        @Body() request: LoginRequest
    ): Promise<ApiResponseDto<LoginResponse>> {
        const response = await this.authService.login(request);
        return ApiResponseDto.success(
            response, 
            this.i18n.t('common.success', { lang: I18nContext.current()?.lang })
        );
    }

    @Post('refresh')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiOperation({ summary: 'Refresh an access token' })
    @ApiCreatedResponse({ description: 'Access token refreshed successfully', type: TokenResponse })
    async refresh(
        @Body() request: RefreshTokenRequest
    ): Promise<ApiResponseDto<TokenResponse>> {
        const response = await this.authService.refresh(request);
        return ApiResponseDto.success(
            response,
            this.i18n.t('common.success', { lang: I18nContext.current()?.lang })
        );
    }
}
