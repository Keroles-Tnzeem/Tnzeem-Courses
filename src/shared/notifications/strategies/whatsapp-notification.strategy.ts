import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';
import { NotificationChannelStrategy } from '../interfaces/notification-channel-strategy.interface';

/**
 * Sends notifications (e.g. OTP codes) via WhatsApp.
 * TODO: wire up the actual WhatsApp Business API provider once credentials are available.
 */
@Injectable()
export class WhatsappNotificationStrategy implements NotificationChannelStrategy {
  private readonly logger = new Logger(WhatsappNotificationStrategy.name);

  supports(channel: NotificationChannelEnum): boolean {
    return channel === NotificationChannelEnum.WHATSAPP;
  }

  async send(
    notification: NotificationEntity,
    recipient: UserEntity,
  ): Promise<void> {
    const to = recipient.phone;
    if (!to) {
      throw new Error('Recipient has no phone number');
    }
    const message = notification.body?.ar ?? notification.body?.en ?? '';
    await this.sendDirect(to, message);
    notification.sentAt = new Date();
  }

  sendDirect(to: string, message: string): Promise<void> {
    // Placeholder until the WhatsApp Business API integration is in place.
    this.logger.log(`[WhatsApp] to=${to} message="${message}"`);
    return Promise.resolve();
  }
}
