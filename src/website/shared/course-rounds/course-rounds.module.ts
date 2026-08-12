import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestCourseRoundsService } from './course-rounds.service';
import { GuestCourseRoundsController } from './course-rounds.controller';
import { RoundEntity } from '../../../staff-dashboard/rounds/entities/round.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RoundEntity])],
    controllers: [GuestCourseRoundsController],
    providers: [GuestCourseRoundsService],
})
export class GuestCourseRoundsModule {}
