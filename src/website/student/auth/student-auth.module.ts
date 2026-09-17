import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../../shared/user/entities/user.entity';
import { UserModule } from '../../../shared/user/user.module';
import { NotificationModule } from '../../../shared/notification/notification.module';
import { SourcesModule } from '../../../staff/staff-dashboard/sources/sources.module';
import { OtpEntity } from './entities/otp.entity';
import { OtpService } from './services/otp.service';
import { StudentAuthService } from './services/student-auth.service';
import { StudentAuthController } from './student-auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OtpEntity]),
    UserModule,
    NotificationModule,
    SourcesModule,
  ],
  controllers: [StudentAuthController],
  providers: [StudentAuthService, OtpService],
  exports: [StudentAuthService],
})
export class StudentAuthModule {}
