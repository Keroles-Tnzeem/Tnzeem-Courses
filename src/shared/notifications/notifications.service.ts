import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { getLang } from '../../common/helpers/lang.helper';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { UserEntity } from '../user/entities/user.entity';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationChannelEnum } from './enums/notification-channel.enum';
import { NotificationTypeEnum } from './enums/notification-type.enum';
import { NotificationStrategyFactory } from './factories/notification-strategy.factory';
import { QueryNotificationRequest } from './dto/requests/query-notification.request';
import { NotificationResponse } from './dto/responses/notification.response';

export interface NotifyInput {
  userId: number;
  type: NotificationTypeEnum;
  title: Record<string, string>;
  body: Record<string, string>;
  data?: Record<string, unknown>;
  channels?: NotificationChannelEnum[];
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly strategyFactory: NotificationStrategyFactory,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Creates one notification row per channel and delivers it through that channel's strategy.
   * Never throws: a delivery problem must not break the business operation that triggered it.
   */
  async notify(input: NotifyInput): Promise<void> {
    const channels = input.channels ?? [
      NotificationChannelEnum.IN_APP,
      NotificationChannelEnum.MAIL,
    ];

    try {
      const recipient = await this.userRepo.findOne({
        where: { id: input.userId },
      });
      if (!recipient) {
        this.logger.warn(
          `Notification skipped, user ${input.userId} not found`,
        );
        return;
      }

      for (const channel of channels) {
        await this.deliver(input, channel, recipient);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${input.type} to user ${input.userId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async deliver(
    input: NotifyInput,
    channel: NotificationChannelEnum,
    recipient: UserEntity,
  ): Promise<void> {
    const notification = this.notificationRepo.create({
      userId: input.userId,
      type: input.type,
      channel,
      title: input.title,
      body: input.body,
      data: input.data ?? null,
    });

    try {
      await this.strategyFactory
        .getStrategy(channel)
        .send(notification, recipient);
    } catch (error) {
      notification.failedReason =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `${channel} delivery failed for user ${input.userId}: ${notification.failedReason}`,
      );
    }

    await this.notificationRepo.save(notification);
  }

  /**
   * Sends a direct message (e.g. OTP verification) through the requested channel
   * without creating a database notification entity.
   */
  async send(
    channel: NotificationChannelEnum,
    to: string,
    message: string,
  ): Promise<void> {
    const strategy = this.strategyFactory.getStrategy(channel);
    if (strategy.sendDirect) {
      return strategy.sendDirect(to, message);
    }
    this.logger.warn(`Direct send not supported for channel: ${channel}`);
  }

  // In-app inbox (current user)

  async findAll(
    userId: number,
    query: QueryNotificationRequest,
    lang: string,
  ): Promise<PaginationResponseDto<NotificationResponse>> {
    const { page = 1, limit = 10, unreadOnly } = query;

    const [rows, total] = await this.notificationRepo.findAndCount({
      where: {
        userId,
        channel: NotificationChannelEnum.IN_APP,
        ...(unreadOnly ? { readAt: IsNull() } : {}),
      },
      order: { audit: { createdAt: 'DESC' } },
      skip: (page - 1) * limit,
      take: limit,
    });

    return PaginationResponseDto.success(
      rows.map((n) => NotificationResponse.fromEntity(n, lang)),
      total,
      page,
      limit,
    );
  }

  /** Latest in-app notifications (newest first). Omit `limit` to return all of them. */
  async findLatest(
    userId: number,
    lang: string,
    limit?: number,
  ): Promise<NotificationResponse[]> {
    const rows = await this.notificationRepo.find({
      where: { userId, channel: NotificationChannelEnum.IN_APP },
      order: { audit: { createdAt: 'DESC' } },
      take: limit,
    });
    return rows.map((n) => NotificationResponse.fromEntity(n, lang));
  }

  async unreadCount(userId: number): Promise<number> {
    return this.notificationRepo.count({
      where: {
        userId,
        channel: NotificationChannelEnum.IN_APP,
        readAt: IsNull(),
      },
    });
  }

  async markAsRead(userId: number, id: number): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId, channel: NotificationChannelEnum.IN_APP },
    });
    if (!notification) {
      throw new NotFoundException(
        this.i18n.t('errors.NOTIFICATION_NOT_FOUND', { lang: getLang() }),
      );
    }
    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationRepo.save(notification);
    }
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepo.update(
      { userId, channel: NotificationChannelEnum.IN_APP, readAt: IsNull() },
      { readAt: new Date() },
    );
  }
}
