import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from '../interfaces/notification-strategy.interface';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';

/**
 * Future notification strategy — see project-phases/phase-3.md.
 * Not wired up to a provider yet; kept here so the factory/resolver already supports it.
 */
@Injectable()
export class EmailNotificationStrategy implements NotificationStrategy {
  private readonly logger = new Logger(EmailNotificationStrategy.name);

  supports(channel: NotificationChannelEnum): boolean {
    return channel === NotificationChannelEnum.EMAIL;
  }

  send(to: string, message: string): Promise<void> {
    // Placeholder until an email provider (e.g. SES, SendGrid) is integrated.
    this.logger.log(`[Email] to=${to} message="${message}"`);
    return Promise.resolve();
  }
}
