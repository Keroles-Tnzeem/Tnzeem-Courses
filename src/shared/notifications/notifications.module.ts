import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationStrategyFactory } from './factories/notification-strategy.factory';
import { InAppNotificationStrategy } from './strategies/in-app-notification.strategy';
import { MailNotificationStrategy } from './strategies/mail-notification.strategy';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationEntity, UserEntity]), AuthModule],
    controllers: [NotificationsController],
    providers: [
        // Strategies
        InAppNotificationStrategy,
        MailNotificationStrategy,
        // Factory
        NotificationStrategyFactory,
        // Service
        NotificationsService,
    ],
    exports: [NotificationsService],
})
export class NotificationsModule {}
