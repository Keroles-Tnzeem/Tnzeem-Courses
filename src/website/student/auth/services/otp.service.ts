import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { OtpEntity } from '../entities/otp.entity';
import { OtpPurposeEnum } from '../enums/otp-purpose.enum';
import { NotificationService } from '../../../../shared/notification/notification.service';
import { NotificationChannelEnum } from '../../../../shared/notification/enums/notification-channel.enum';
import { getLang } from '../../../../common/helpers/lang.helper';

const OTP_TTL_SECONDS = 5 * 60;
const OTP_MAX_ATTEMPTS = 5;

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

  async generateAndSend(
    phone: string,
    purpose: OtpPurposeEnum,
  ): Promise<{ expiresInSeconds: number; code: string }> {
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
