import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class StatisticsRefreshTask {
  private readonly logger = new Logger(StatisticsRefreshTask.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async refreshTrainerStatisticsView(): Promise<void> {
    try {
      this.logger.log('Refreshing materialized_trainer_statistics_view...');
      await this.dataSource.query(
        'REFRESH MATERIALIZED VIEW CONCURRENTLY materialized_trainer_statistics_view',
      );
      this.logger.log('materialized_trainer_statistics_view refreshed successfully.');
    } catch (error) {
      this.logger.error('Failed to refresh materialized_trainer_statistics_view', error);
    }
  }
}
