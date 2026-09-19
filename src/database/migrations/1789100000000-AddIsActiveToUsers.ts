import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToUsers1789100000000 implements MigrationInterface {
  name = 'AddIsActiveToUsers1789100000000';

  // IF [NOT] EXISTS: safe on databases that already got the column through
  // dev-time `synchronize`, and safe to re-run.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "is_active"`,
    );
  }
}
