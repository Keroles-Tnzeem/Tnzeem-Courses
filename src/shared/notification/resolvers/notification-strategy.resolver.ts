import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';
import { NotificationStrategy } from '../interfaces/notification-strategy.interface';
import { WhatsappNotificationStrategy } from '../strategies/whatsapp-notification.strategy';
import { EmailNotificationStrategy } from '../strategies/email-notification.strategy';

@Injectable()
export class NotificationStrategyResolver {
  private readonly strategies: NotificationStrategy[];

  constructor(
    private readonly whatsappStrategy: WhatsappNotificationStrategy,
    private readonly emailStrategy: EmailNotificationStrategy,
  ) {
    // Register all strategies here
    this.strategies = [
      this.whatsappStrategy,
      this.emailStrategy,
      // Future strategies (SMS, push, etc.) will be added here
    ];
  }

  resolve(channel: NotificationChannelEnum): NotificationStrategy {
    const strategy = this.strategies.find((s) => s.supports(channel));
    if (!strategy) {
      throw new InternalServerErrorException(
        `No notification strategy found for channel: ${channel}`,
      );
    }
    return strategy;
  }
}
