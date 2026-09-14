import { NotificationChannelEnum } from '../enums/notification-channel.enum';

export interface NotificationStrategy {
  /**
   * Checks if the strategy supports the given channel.
   */
  supports(channel: NotificationChannelEnum): boolean;

  /**
   * Delivers a message to the given recipient (phone number or email address).
   */
  send(to: string, message: string): Promise<void>;
}
