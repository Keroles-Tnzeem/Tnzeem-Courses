import { Injectable } from '@nestjs/common';
import { NotificationStrategyResolver } from './resolvers/notification-strategy.resolver';
import { NotificationChannelEnum } from './enums/notification-channel.enum';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationStrategyResolver: NotificationStrategyResolver,
  ) {}

  async send(
    channel: NotificationChannelEnum,
    to: string,
    message: string,
  ): Promise<void> {
    const strategy = this.notificationStrategyResolver.resolve(channel);
    return strategy.send(to, message);
  }
}
