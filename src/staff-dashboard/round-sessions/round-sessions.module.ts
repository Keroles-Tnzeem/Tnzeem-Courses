import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundSessionEntity } from './entities/round-session.entity';
import { RoundSessionsService } from './round-sessions.service';
import { RoundSessionsController } from './round-sessions.controller';
import { RoundEntity } from '../rounds/entities/round.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([RoundSessionEntity, RoundEntity]),
    ],
    controllers: [RoundSessionsController],
    providers: [RoundSessionsService],
    exports: [RoundSessionsService],
})
export class RoundSessionsModule {}
