import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'materialized_trainer_statistics_view', synchronize: false })
export class TrainerStatistics {
  @PrimaryColumn({ name: 'trainer_id' })
  trainerId: number;

  @Column({ name: 'courses_count', type: 'bigint' })
  coursesCount: number;

  @Column({ name: 'rounds_count', type: 'bigint' })
  roundsCount: number;

  @Column({ name: 'orders_count', type: 'bigint' })
  ordersCount: number;

  @Column({ name: 'sessions_count', type: 'bigint' })
  sessionsCount: number;
}
