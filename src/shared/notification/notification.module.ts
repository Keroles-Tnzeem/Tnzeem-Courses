import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationStrategyResolver } from './resolvers/notification-strategy.resolver';
import { WhatsappNotificationStrategy } from './strategies/whatsapp-notification.strategy';
import { EmailNotificationStrategy } from './strategies/email-notification.strategy';

@Module({
  providers: [
    NotificationService,
    NotificationStrategyResolver,
    WhatsappNotificationStrategy,
    EmailNotificationStrategy,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
