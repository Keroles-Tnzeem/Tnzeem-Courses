import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TrainerStatistics } from './entities/trainer-statistics.entity';
import { HomepageService } from './services/homepage.service';
import { HomepageController } from './controllers/homepage.controller';
import { StatisticsRefreshTask } from './tasks/statistics-refresh.task';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { TrainerInfoEntity } from '../../shared/user/entities/trainer-info.entity';
import { StorageModule } from '../../shared/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainerStatistics,
      UserEntity,
      TrainerInfoEntity,
    ]),
    ScheduleModule.forRoot(),
    StorageModule,
  ],
  controllers: [HomepageController],
  providers: [HomepageService, StatisticsRefreshTask],
})
export class InstructorHomepageModule {}
