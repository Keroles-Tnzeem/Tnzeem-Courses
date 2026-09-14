import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from '../interfaces/notification-strategy.interface';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';

/**
 * Sends notifications (currently OTP codes) via WhatsApp.
 * This is the active/default notification strategy for now — see project-phases/phase-3.md.
 * TODO: wire up the actual WhatsApp Business API provider once credentials are available.
 */
@Injectable()
export class WhatsappNotificationStrategy implements NotificationStrategy {
  private readonly logger = new Logger(WhatsappNotificationStrategy.name);

  supports(channel: NotificationChannelEnum): boolean {
    return channel === NotificationChannelEnum.WHATSAPP;
  }

  send(to: string, message: string): Promise<void> {
    // Placeholder until the WhatsApp Business API integration is in place.
    this.logger.log(`[WhatsApp] to=${to} message="${message}"`);
    return Promise.resolve();
  }
}
