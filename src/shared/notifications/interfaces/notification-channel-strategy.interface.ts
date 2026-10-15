import { UserEntity } from '../../user/entities/user.entity';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';

export interface NotificationChannelStrategy {
    supports(channel: NotificationChannelEnum): boolean;

    /**
     * Delivers the notification to the recipient. Sets delivery fields
     * (e.g. sentAt) on the entity; persistence is handled by NotificationsService.
     * Throw on failure — the service records the reason and never lets it reach the caller.
     */
    send(notification: NotificationEntity, recipient: UserEntity): Promise<void>;
}
