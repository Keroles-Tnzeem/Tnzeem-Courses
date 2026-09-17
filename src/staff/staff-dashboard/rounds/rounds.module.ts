import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundEntity } from './entities/round.entity';
import { RoundsService } from './rounds.service';
import { RoundsController } from './rounds.controller';
import { CourseEntity } from '../courses/entities/course.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([RoundEntity, CourseEntity]),
    ],
    controllers: [RoundsController],
    providers: [RoundsService],
    exports: [RoundsService],
})
export class RoundsModule {}
