import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainerStatisticsView1756736265000 implements MigrationInterface {
  name = 'CreateTrainerStatisticsView1756736265000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS materialized_trainer_statistics_view AS
      SELECT
        c.trainer_id                          AS trainer_id,
        COUNT(DISTINCT c.id)                  AS courses_count,
        COUNT(DISTINCT r.id)                  AS rounds_count,
        COUNT(DISTINCT o.id)                  AS orders_count,
        COUNT(DISTINCT rs.id)                 AS sessions_count
      FROM courses c
      LEFT JOIN rounds  r  ON r.course_id  = c.id  AND r.deleted_at  IS NULL
      LEFT JOIN orders  o  ON o.trainer_id = c.trainer_id
      LEFT JOIN round_sessions rs ON rs.round_id = r.id AND rs.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY c.trainer_id
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_trainer_statistics_view_trainer_id
      ON materialized_trainer_statistics_view (trainer_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_trainer_statistics_view_trainer_id`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS materialized_trainer_statistics_view`);
  }
}
