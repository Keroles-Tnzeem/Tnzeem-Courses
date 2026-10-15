import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserEntity } from '../../user/entities/user.entity';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';
import { renderMailTemplate } from '../templates/mail.template';
import { NotificationChannelStrategy } from '../interfaces/notification-channel-strategy.interface';

@Injectable()
export class MailNotificationStrategy implements NotificationChannelStrategy {
  private readonly logger = new Logger(MailNotificationStrategy.name);
  private transporter?: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {}

  supports(channel: NotificationChannelEnum): boolean {
    return channel === NotificationChannelEnum.MAIL;
  }

  async send(
    notification: NotificationEntity,
    recipient: UserEntity,
  ): Promise<void> {
    if (!recipient.email) {
      throw new Error('Recipient has no email address');
    }

    const { ar, en } = this.content(notification);

    // Use a pre-rendered HTML template if provided in notification data,
    // otherwise render the default bilingual template.
    const htmlBody: string =
      typeof (notification.data as any)?.html === 'string'
        ? (notification.data as any).html
        : renderMailTemplate({
            appName: this.configService.get<string>('app.name') ?? 'Tnzeem',
            en,
            ar,
            action: this.action(notification),
          });

    try {
      await this.getTransporter().sendMail({
        from: this.configService.get<string>('mail.from'),
        to: recipient.email,
        subject: ar.title,
        text: ar.body,
        html: htmlBody,
      });
    } catch (err) {
      // Drop the cached transporter — a new one will be created on the next attempt
      this.resetTransporter();
      throw err;
    }

    notification.sentAt = new Date();
  }

  private content(n: NotificationEntity) {
    const pick = (field: Record<string, string>, lang: 'ar' | 'en') =>
      field[lang] ?? field['en'] ?? field['ar'] ?? '';
    return {
      ar: { title: pick(n.title, 'ar'), body: pick(n.body, 'ar') },
      en: { title: pick(n.title, 'en'), body: pick(n.body, 'en') },
    };
  }

  /** A notification can carry `data.actionUrl` to render a button in the email. */
  private action(n: NotificationEntity) {
    const url = n.data?.actionUrl;
    return typeof url === 'string'
      ? { url, label: { en: 'View details', ar: 'عرض التفاصيل' } }
      : undefined;
  }

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const host = this.configService.get<string>('mail.host');
    if (!host) {
      throw new Error('MAIL_HOST is not configured');
    }

    const port = this.configService.get<number>('mail.port') ?? 465;
    const secure = this.configService.get<boolean>('mail.secure') ?? true;
    const user = this.configService.get<string>('mail.user');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure, // true = SSL/TLS on connect (port 465)
      auth: user
        ? { user, pass: this.configService.get<string>('mail.password') }
        : undefined,
      tls: {
        // Accept older TLS versions (Hostinger/cPanel can be strict)
        minVersion: 'TLSv1' as any,
        // Do not reject self-signed or mismatched certs in dev
        rejectUnauthorized: false,
      },
    });

    this.logger.log(
      `Mail transport initialised (${host}:${port}, secure=${secure})`,
    );
    return this.transporter;
  }

  /** Clears the cached transporter so the next send attempt rebuilds it. */
  private resetTransporter(): void {
    this.transporter = undefined;
  }
}
