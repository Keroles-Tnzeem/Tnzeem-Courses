import { MigrationInterface, QueryRunner } from 'typeorm';

const VIEW_SELECT = (sessionFilter: string) => `
  SELECT
    c.trainer_id                          AS trainer_id,
    COUNT(DISTINCT c.id)                  AS courses_count,
    COUNT(DISTINCT r.id)                  AS rounds_count,
    COUNT(DISTINCT o.id)                  AS orders_count,
    COUNT(DISTINCT rs.id)                 AS sessions_count
  FROM courses c
  LEFT JOIN rounds  r  ON r.course_id  = c.id  AND r.deleted_at  IS NULL
  LEFT JOIN orders  o  ON o.trainer_id = c.trainer_id
  LEFT JOIN round_sessions rs ON rs.round_id = r.id${sessionFilter}
  WHERE c.deleted_at IS NULL
  GROUP BY c.trainer_id
`;

export class HardDeleteRoundSessions1789400000000 implements MigrationInterface {
  name = 'HardDeleteRoundSessions1789400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM round_sessions WHERE deleted_at IS NOT NULL`);

    // The statistics view reads round_sessions.deleted_at, so it must be rebuilt around the drop.
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS materialized_trainer_statistics_view`);
    await queryRunner.query(`ALTER TABLE round_sessions DROP COLUMN IF EXISTS deleted_at`);
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW materialized_trainer_statistics_view AS ${VIEW_SELECT('')}`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_trainer_statistics_view_trainer_id
      ON materialized_trainer_statistics_view (trainer_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS materialized_trainer_statistics_view`);
    await queryRunner.query(`ALTER TABLE round_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL`);
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW materialized_trainer_statistics_view AS ${VIEW_SELECT(' AND rs.deleted_at IS NULL')}`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_trainer_statistics_view_trainer_id
      ON materialized_trainer_statistics_view (trainer_id)
    `);
  }
}
