import { Module } from '@nestjs/common';
import { StudentAuthModule } from './auth/student-auth.module';

@Module({
  imports: [StudentAuthModule],
})
export class WebsiteStudentModule {}
