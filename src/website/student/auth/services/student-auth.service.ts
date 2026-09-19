import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  ServiceUnavailableException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as appleSignin from 'apple-signin-auth';
import { AppleIdTokenType } from 'apple-signin-auth';
import { UserEntity } from '../../../../shared/user/entities/user.entity';
import { UserTypeEnum } from '../../../../shared/user/enums/user-type.enum';
import { UserService } from '../../../../shared/user/user.service';
import { JwtTokenService } from '../../../../shared/auth/services/jwt.service';
import { SourcesService } from '../../../../staff/staff-dashboard/sources/sources.service';
import { getLang } from '../../../../common/helpers/lang.helper';
import { OtpService, OTP_TTL_SECONDS } from './otp.service';
import { OtpPurposeEnum } from '../enums/otp-purpose.enum';
import { RegisterStudentRequest } from '../dto/requests/register-student.request';
import { LoginStudentRequest } from '../dto/requests/login-student.request';
import { GoogleLoginRequest } from '../dto/requests/google-login.request';
import { AppleLoginRequest } from '../dto/requests/apple-login.request';
import { SendOtpRequest } from '../dto/requests/send-otp.request';
import { VerifyOtpRequest } from '../dto/requests/verify-otp.request';
import { ForgetPasswordRequest } from '../dto/requests/forget-password.request';
import { LoginResponse } from '../../../../shared/auth/dto/responses/login.response';
import { OtpSentResponse } from '../dto/responses/otp-sent.response';
import { VerifyOtpResponse } from '../dto/responses/verify-otp.response';

@Injectable()
export class StudentAuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly sourcesService: SourcesService,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('oauth.google.clientId'),
    );
  }

  private buildLoginResponse(user: UserEntity): LoginResponse {
    if (!user.isActive) {
      throw new ForbiddenException(
        this.i18n.t('errors.ACCOUNT_DISABLED', { lang: getLang() }),
      );
    }

    const payload = {
      sub: user.id,
      userType: user.userType,
      permissions: this.userService.getPermissions(user),
    };

    const { accessToken, expiresIn } =
      this.jwtTokenService.generateAccessToken(payload);
    const refreshToken = this.jwtTokenService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expireIn: expiresIn,
      url: 'student-dashboard',
      user: this.userService.toUserDataResponse(user),
    };
  }

  private findStudentByPhoneOrNull(phone: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { phone, userType: UserTypeEnum.STUDENT },
      relations: { userPermissions: { permission: true } },
    });
  }

  private async findStudentByPhone(
    phone: string,
    lang: string,
  ): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { phone, userType: UserTypeEnum.STUDENT },
      relations: { userPermissions: { permission: true } },
    });

    if (!user) {
      throw new BadRequestException(
        this.i18n.t('errors.USER_NOT_FOUND', { lang }),
      );
    }

    return user;
  }

  private async resolveSourceId(
    source: string | undefined,
  ): Promise<number | undefined> {
    if (!source) {
      return undefined;
    }

    const resolvedId = await this.sourcesService.findIdByName(source);
    return resolvedId ?? undefined;
  }

  async register(dto: RegisterStudentRequest): Promise<OtpSentResponse> {
    const lang = getLang();

    const emailExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (emailExists) {
      throw new ConflictException(this.i18n.t('errors.EMAIL_TAKEN', { lang }));
    }

    const phoneExists = await this.userRepo.findOne({
      where: { phone: dto.phone },
    });
    if (phoneExists) {
      throw new ConflictException(this.i18n.t('errors.PHONE_TAKEN', { lang }));
    }

    const sourceId = await this.resolveSourceId(dto.source);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const student = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      gender: dto.gender,
      password: hashedPassword,
      userType: UserTypeEnum.STUDENT,
      sourceId,
    });

    const saved = await this.userRepo.save(student);

    // The account is only useful once the student can verify it, so if the OTP
    // cannot be sent, undo the sign-up (the phone/email stay free for a retry).
    let expiresInSeconds: number;
    try {
      ({ expiresInSeconds } = await this.otpService.generateAndSend(
        saved.phone,
        OtpPurposeEnum.REGISTER,
      ));
    } catch (error) {
      await this.userRepo.delete(saved.id);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        this.i18n.t('errors.OTP_SEND_FAILED', { lang }),
      );
    }

    return { phone: saved.phone, expiresInSeconds };
  }

  private async findOrCreateSocialStudent(params: {
    idColumn: 'googleId' | 'appleId';
    providerId: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserEntity> {
    const { idColumn, providerId, email, firstName, lastName } = params;

    const relations = { userPermissions: { permission: true } } as const;

    const providerWhere =
      idColumn === 'googleId'
        ? { googleId: providerId, userType: UserTypeEnum.STUDENT }
        : { appleId: providerId, userType: UserTypeEnum.STUDENT };

    const existingByProvider = await this.userRepo.findOne({
      where: providerWhere,
      relations,
    });
    if (existingByProvider) {
      return existingByProvider;
    }

    if (email) {
      const existingByEmail = await this.userRepo.findOne({
        where: { email, userType: UserTypeEnum.STUDENT },
        relations,
      });
      if (existingByEmail) {
        if (idColumn === 'googleId') {
          existingByEmail.googleId = providerId;
        } else {
          existingByEmail.appleId = providerId;
        }
        return this.userRepo.save(existingByEmail);
      }
    }

    const hashedPassword = await bcrypt.hash(randomUUID(), 10);
    const created = this.userRepo.create({
      firstName: firstName || email?.split('@')[0] || 'Student',
      lastName: lastName || '',
      email,
      password: hashedPassword,
      userType: UserTypeEnum.STUDENT,
      // Google verifies the user's identity for us, so treat them as phone-verified by default.
      ...(idColumn === 'googleId'
        ? { googleId: providerId, phoneVerifiedAt: new Date() }
        : { appleId: providerId }),
    });

    return this.userRepo.save(created);
  }

  async loginWithGoogle(dto: GoogleLoginRequest): Promise<LoginResponse> {
    const lang = getLang();
    const clientId = this.configService.get<string>('oauth.google.clientId');

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch {
      payload = undefined;
    }

    if (!payload?.sub) {
      throw new UnauthorizedException(
        this.i18n.t('errors.INVALID_GOOGLE_TOKEN', { lang }),
      );
    }

    const user = await this.findOrCreateSocialStudent({
      idColumn: 'googleId',
      providerId: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
    });

    return this.buildLoginResponse(user);
  }

  async loginWithApple(dto: AppleLoginRequest): Promise<LoginResponse> {
    const lang = getLang();
    const clientId = this.configService.get<string>('oauth.apple.clientId');

    let payload: AppleIdTokenType | undefined;
    try {
      payload = await appleSignin.verifyIdToken(dto.idToken, {
        audience: clientId,
      });
    } catch {
      payload = undefined;
    }

    if (!payload?.sub) {
      throw new UnauthorizedException(
        this.i18n.t('errors.INVALID_APPLE_TOKEN', { lang }),
      );
    }

    const user = await this.findOrCreateSocialStudent({
      idColumn: 'appleId',
      providerId: payload.sub,
      email: payload.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    return this.buildLoginResponse(user);
  }

  async login(dto: LoginStudentRequest): Promise<LoginResponse> {
    const lang = getLang();
    const user = await this.userRepo.findOne({
      where: { phone: dto.phone, userType: UserTypeEnum.STUDENT },
    });

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('errors.INVALID_CREDENTIALS', { lang }),
      );
    }

    const passwordMatches = await this.userService.validatePassword(
      user,
      dto.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException(
        this.i18n.t('errors.INVALID_CREDENTIALS', { lang }),
      );
    }

    if (!user.phoneVerifiedAt) {
      throw new UnauthorizedException(
        this.i18n.t('errors.PHONE_NOT_VERIFIED', { lang }),
      );
    }

    return this.buildLoginResponse(user);
  }

  async sendOtp(dto: SendOtpRequest): Promise<OtpSentResponse> {
    const lang = getLang();

    // For login/forget-password the phone must belong to a student. An unknown
    // phone gets the same response as a known one (no code is sent) so the
    // endpoint can't be used to find out which phones are registered.
    if (dto.purpose !== OtpPurposeEnum.REGISTER) {
      const user = await this.findStudentByPhoneOrNull(dto.phone);
      if (!user) {
        return { phone: dto.phone, expiresInSeconds: OTP_TTL_SECONDS };
      }
      // Passwordless login is only allowed for phones already verified at registration.
      if (dto.purpose === OtpPurposeEnum.LOGIN && !user.phoneVerifiedAt) {
        throw new UnauthorizedException(
          this.i18n.t('errors.PHONE_NOT_VERIFIED', { lang }),
        );
      }
    }

    const { expiresInSeconds, code } = await this.otpService.generateAndSend(
      dto.phone,
      dto.purpose,
    );

    return { phone: dto.phone, expiresInSeconds, code };
  }

  async forgetPassword(dto: ForgetPasswordRequest): Promise<OtpSentResponse> {
    // Same non-disclosure rule as sendOtp: unknown phone => identical response.
    const user = await this.findStudentByPhoneOrNull(dto.phone);
    if (!user) {
      return { phone: dto.phone, expiresInSeconds: OTP_TTL_SECONDS };
    }

    const { expiresInSeconds, code } = await this.otpService.generateAndSend(
      dto.phone,
      OtpPurposeEnum.FORGET_PASSWORD,
    );

    return { phone: dto.phone, expiresInSeconds, code };
  }

  async verifyOtp(dto: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const lang = getLang();

    if (dto.purpose === OtpPurposeEnum.FORGET_PASSWORD && !dto.newPassword) {
      throw new BadRequestException(
        this.i18n.t('errors.NEW_PASSWORD_REQUIRED', { lang }),
      );
    }

    if (dto.purpose === OtpPurposeEnum.LOGIN) {
      const candidate = await this.findStudentByPhoneOrNull(dto.phone);
      if (!candidate) {
        throw new BadRequestException(
          this.i18n.t('errors.OTP_NOT_FOUND', { lang }),
        );
      }
      if (!candidate.phoneVerifiedAt) {
        throw new UnauthorizedException(
          this.i18n.t('errors.PHONE_NOT_VERIFIED', { lang }),
        );
      }
    }

    await this.otpService.verify(dto.phone, dto.code, dto.purpose);

    if (dto.purpose === OtpPurposeEnum.REGISTER) {
      const user = await this.findStudentByPhone(dto.phone, lang);
      user.phoneVerifiedAt = new Date();
      const saved = await this.userRepo.save(user);
      const loginResponse = this.buildLoginResponse(saved);
      return { verified: true, ...loginResponse };
    }

    if (dto.purpose === OtpPurposeEnum.FORGET_PASSWORD) {
      const user = await this.findStudentByPhone(dto.phone, lang);
      user.password = await bcrypt.hash(dto.newPassword as string, 10);
      // The OTP was delivered to this phone, so it also proves ownership of it.
      user.phoneVerifiedAt ??= new Date();
      await this.userRepo.save(user);
      // No tokens: the student must sign in again with the new password.
      return { verified: true };
    }

    // OtpPurposeEnum.LOGIN — passwordless login: verifying the OTP logs the student in.
    const user = await this.findStudentByPhone(dto.phone, lang);
    const loginResponse = this.buildLoginResponse(user);
    return { verified: true, ...loginResponse };
  }
}
