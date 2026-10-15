import { Injectable } from '@nestjs/common';
import { NotificationChannelStrategy } from '../interfaces/notification-channel-strategy.interface';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';

/**
 * In-app notifications are delivered by being persisted: the row itself is what
 * the dashboards read. Nothing to push, so send() is a no-op.
 */
@Injectable()
export class InAppNotificationStrategy implements NotificationChannelStrategy {
    supports(channel: NotificationChannelEnum): boolean {
        return channel === NotificationChannelEnum.IN_APP;
    }

    async send(): Promise<void> {
        return;
    }
}
