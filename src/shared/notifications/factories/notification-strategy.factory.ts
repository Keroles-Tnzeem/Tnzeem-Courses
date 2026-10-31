import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';
import { NotificationChannelStrategy } from '../interfaces/notification-channel-strategy.interface';
import { InAppNotificationStrategy } from '../strategies/in-app-notification.strategy';
import { MailNotificationStrategy } from '../strategies/mail-notification.strategy';
import { WhatsappNotificationStrategy } from '../strategies/whatsapp-notification.strategy';

@Injectable()
export class NotificationStrategyFactory {
  private readonly strategies: NotificationChannelStrategy[];

  constructor(
    private readonly inAppStrategy: InAppNotificationStrategy,
    private readonly mailStrategy: MailNotificationStrategy,
    private readonly whatsappStrategy: WhatsappNotificationStrategy,
  ) {
    // Register all channel strategies here (In-app, Mail, WhatsApp, future: push, ...)
    this.strategies = [
      this.inAppStrategy,
      this.mailStrategy,
      this.whatsappStrategy,
    ];
  }

  getStrategy(channel: NotificationChannelEnum): NotificationChannelStrategy {
    const strategy = this.strategies.find((s) => s.supports(channel));
    if (!strategy) {
      throw new InternalServerErrorException(
        `No notification strategy found for channel: ${channel}`,
      );
    }
    return strategy;
  }
}
