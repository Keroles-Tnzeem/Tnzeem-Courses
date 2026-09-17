import { Module } from '@nestjs/common';
import { StudentAuthModule } from './auth/student-auth.module';
import { StudentProfileModule } from './profile/profile.module';
import { StudentOrdersModule } from './orders/orders.module';
import { StudentEnrollmentsModule } from './enrollments/enrollments.module';

@Module({
  imports: [
    StudentAuthModule,
    StudentProfileModule,
    StudentOrdersModule,
    StudentEnrollmentsModule,
  ],
})
export class WebsiteStudentModule {}
