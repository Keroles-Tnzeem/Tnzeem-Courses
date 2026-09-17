import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundSessionEntity } from '../../staff-dashboard/round-sessions/entities/round-session.entity';
import { RoundEntity } from '../../staff-dashboard/rounds/entities/round.entity';
import { InstructorSessionsController } from './sessions.controller';
import { InstructorSessionsService } from './sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoundSessionEntity, RoundEntity])],
  controllers: [InstructorSessionsController],
  providers: [InstructorSessionsService],
  exports: [InstructorSessionsService],
})
export class InstructorSessionsModule {}
