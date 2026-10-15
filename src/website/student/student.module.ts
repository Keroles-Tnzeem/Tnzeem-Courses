import { Module } from '@nestjs/common';
import { StudentAuthModule } from './auth/student-auth.module';
import { StudentProfileModule } from './profile/profile.module';
import { StudentOrdersModule } from './orders/orders.module';
import { StudentEnrollmentsModule } from './enrollments/enrollments.module';
import { StudentNotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    StudentAuthModule,
    StudentProfileModule,
    StudentOrdersModule,
    StudentEnrollmentsModule,
    StudentNotificationsModule,
  ],
})
export class WebsiteStudentModule {}
