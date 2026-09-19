import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { OtpEntity } from '../entities/otp.entity';
import { OtpPurposeEnum } from '../enums/otp-purpose.enum';
import { NotificationService } from '../../../../shared/notification/notification.service';
import { NotificationChannelEnum } from '../../../../shared/notification/enums/notification-channel.enum';
import { getLang } from '../../../../common/helpers/lang.helper';

export const OTP_TTL_SECONDS = 5 * 60;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_SENDS_PER_HOUR = 5;

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpEntity)
    private readonly otpRepo: Repository<OtpEntity>,
    private readonly notificationService: NotificationService,
    private readonly i18n: I18nService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Resend limits per phone+purpose. Without them, requesting a new OTP resets
   * the per-OTP attempt counter, making the 5-attempt cap bypassable.
   */
  private async assertCanSend(
    phone: string,
    purpose: OtpPurposeEnum,
  ): Promise<void> {
    const lang = getLang();
    const now = Date.now();

    const last = await this.otpRepo.findOne({
      where: { phone, purpose },
      order: { id: 'DESC' },
    });
    if (
      last &&
      now - last.audit.createdAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000
    ) {
      throw new HttpException(
        this.i18n.t('errors.OTP_RESEND_TOO_SOON', { lang }),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const sentLastHour = await this.otpRepo.count({
      where: {
        phone,
        purpose,
        audit: { createdAt: MoreThan(new Date(now - 60 * 60 * 1000)) },
      },
    });
    if (sentLastHour >= OTP_MAX_SENDS_PER_HOUR) {
      throw new HttpException(
        this.i18n.t('errors.OTP_LIMIT_REACHED', { lang }),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async generateAndSend(
    phone: string,
    purpose: OtpPurposeEnum,
  ): Promise<{ expiresInSeconds: number; code: string }> {
    await this.assertCanSend(phone, purpose);

    // Invalidate any previous unconsumed OTPs for the same phone/purpose
    await this.otpRepo.update(
      { phone, purpose, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );

    const code = this.generateCode();
    const hashedCode = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    const otp = this.otpRepo.create({
      phone,
      purpose,
      code: hashedCode,
      expiresAt,
      attempts: 0,
    });
    await this.otpRepo.save(otp);

    // Strategy pattern: WhatsApp today, Email in the future — see project-phases/phase-3.md
    await this.notificationService.send(
      NotificationChannelEnum.WHATSAPP,
      phone,
      `Your Tnzeem verification code is ${code}. It expires in ${OTP_TTL_SECONDS / 60} minutes.`,
    );

    return { expiresInSeconds: OTP_TTL_SECONDS, code };
  }

  async verify(
    phone: string,
    code: string,
    purpose: OtpPurposeEnum,
  ): Promise<void> {
    const lang = getLang();
    const otp = await this.otpRepo.findOne({
      where: { phone, purpose, consumedAt: IsNull() },
      order: { id: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException(
        this.i18n.t('errors.OTP_NOT_FOUND', { lang }),
      );
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        this.i18n.t('errors.OTP_EXPIRED', { lang }),
      );
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      throw new BadRequestException(
        this.i18n.t('errors.OTP_ATTEMPTS_EXCEEDED', { lang }),
      );
    }

    const matches = await bcrypt.compare(code, otp.code);
    if (!matches) {
      otp.attempts += 1;
      await this.otpRepo.save(otp);
      throw new BadRequestException(
        this.i18n.t('errors.OTP_INVALID', { lang }),
      );
    }

    otp.consumedAt = new Date();
    await this.otpRepo.save(otp);
  }
}
