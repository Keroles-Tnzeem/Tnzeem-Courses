import { Throttle } from '@nestjs/throttler';
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { StudentAuthService } from './services/student-auth.service';
import { RegisterStudentRequest } from './dto/requests/register-student.request';
import { LoginStudentRequest } from './dto/requests/login-student.request';
import { GoogleLoginRequest } from './dto/requests/google-login.request';
import { SendOtpRequest } from './dto/requests/send-otp.request';
import { VerifyOtpRequest } from './dto/requests/verify-otp.request';
import { ForgetPasswordRequest } from './dto/requests/forget-password.request';
import { LoginResponse } from '../../../shared/auth/dto/responses/login.response';
import { OtpSentResponse } from './dto/responses/otp-sent.response';
import { VerifyOtpResponse } from './dto/responses/verify-otp.response';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';

@ApiTags('Website - Student Auth')
@Controller('website/student/auth')
export class StudentAuthController {
  constructor(
    private readonly studentAuthService: StudentAuthService,
    private readonly i18n: I18nService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({
    summary:
      'Register a new student account (also triggers a phone verification OTP)',
  })
  @ApiCreatedResponse({
    description: 'Student registered successfully',
    type: OtpSentResponse,
  })
  async register(
    @Body() request: RegisterStudentRequest,
  ): Promise<ApiResponseDto<OtpSentResponse>> {
    const response = await this.studentAuthService.register(request);
    return ApiResponseDto.success(
      response,
      this.i18n.t('common.created', { lang: I18nContext.current()?.lang }),
    );
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: 'Authenticate a student with email/password' })
  @ApiCreatedResponse({
    description: 'Student authenticated successfully',
    type: LoginResponse,
  })
  async login(
    @Body() request: LoginStudentRequest,
  ): Promise<ApiResponseDto<LoginResponse>> {
    const response = await this.studentAuthService.login(request);
    return ApiResponseDto.success(
      response,
      this.i18n.t('common.success', { lang: I18nContext.current()?.lang }),
    );
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('google')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({
    summary:
      'Register or log in a student using a Google ID token (verified server-side)',
  })
  @ApiCreatedResponse({
    description: 'Student authenticated successfully',
    type: LoginResponse,
  })
  async loginWithGoogle(
    @Body() request: GoogleLoginRequest,
  ): Promise<ApiResponseDto<LoginResponse>> {
    const response = await this.studentAuthService.loginWithGoogle(request);
    return ApiResponseDto.success(
      response,
      this.i18n.t('common.success', { lang: I18nContext.current()?.lang }),
    );
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forget-password')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({ summary: "Request an OTP to reset a student's password" })
  @ApiCreatedResponse({
    description: 'OTP sent successfully',
    type: OtpSentResponse,
  })
  async forgetPassword(
    @Body() request: ForgetPasswordRequest,
  ): Promise<ApiResponseDto<OtpSentResponse>> {
    const response = await this.studentAuthService.forgetPassword(request);
    return ApiResponseDto.success(
      response,
      this.i18n.t('common.success', { lang: I18nContext.current()?.lang }),
    );
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('send-otp')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({
    summary:
      'Send an OTP for register/login/forget-password (e.g. to log in without a password, or to resend a code)',
  })
  @ApiCreatedResponse({
    description: 'OTP sent successfully',
    type: OtpSentResponse,
  })
  async sendOtp(
    @Body() request: SendOtpRequest,
  ): Promise<ApiResponseDto<OtpSentResponse>> {
    const response = await this.studentAuthService.sendOtp(request);
    return ApiResponseDto.success(
      response,
      this.i18n.t('common.success', { lang: I18nContext.current()?.lang }),
    );
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('verify-otp')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiOperation({
    summary:
      'Verify an OTP. Completes phone verification (register), logs the student in (login), or resets the password (forget_password)',
  })
  @ApiCreatedResponse({
    description: 'OTP verified successfully',
    type: VerifyOtpResponse,
  })
  async verifyOtp(
    @Body() request: VerifyOtpRequest,
  ): Promise<ApiResponseDto<VerifyOtpResponse>> {
    const response = await this.studentAuthService.verifyOtp(request);
    return ApiResponseDto.success(
      response,
      this.i18n.t('common.success', { lang: I18nContext.current()?.lang }),
    );
  }
}
