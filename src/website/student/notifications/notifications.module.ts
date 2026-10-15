import { Module } from '@nestjs/common';
import { NotificationsModule } from '../../../shared/notifications/notifications.module';
import { StudentNotificationsController } from './notifications.controller';

@Module({
  imports: [NotificationsModule],
  controllers: [StudentNotificationsController],
})
export class StudentNotificationsModule {}
