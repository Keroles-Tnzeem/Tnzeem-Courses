import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundSessionEntity } from '../../staff/staff-dashboard/round-sessions/entities/round-session.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { MeetingsService } from './meetings.service';
import { MicrosoftGraphAuthService } from './services/microsoft-graph-auth.service';
import { MicrosoftGraphCalendarService } from './services/microsoft-graph-calendar.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoundSessionEntity, EnrollmentEntity])],
  providers: [
    MicrosoftGraphAuthService,
    MicrosoftGraphCalendarService,
    MeetingsService,
  ],
  exports: [
    MeetingsService,
    MicrosoftGraphAuthService,
    MicrosoftGraphCalendarService,
  ],
})
export class MeetingsModule {}
