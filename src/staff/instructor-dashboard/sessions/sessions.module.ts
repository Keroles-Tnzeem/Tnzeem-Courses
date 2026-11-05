import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundSessionEntity } from '../../staff-dashboard/round-sessions/entities/round-session.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { InstructorSessionsController } from './sessions.controller';
import { InstructorSessionsService } from './sessions.service';
import { MeetingsModule } from '../../../shared/meetings/meetings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoundSessionEntity, RoundEntity]),
    MeetingsModule,
  ],
  controllers: [InstructorSessionsController],
  providers: [InstructorSessionsService],
  exports: [InstructorSessionsService],
})
export class InstructorSessionsModule {}
