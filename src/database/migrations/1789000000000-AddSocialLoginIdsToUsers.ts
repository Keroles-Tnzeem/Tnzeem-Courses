import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocialLoginIdsToUsers1789000000000 implements MigrationInterface {
  name = 'AddSocialLoginIdsToUsers1789000000000';

  // Each column (and its unique constraint) is only added when the column is
  // missing, so databases that already got them through dev-time `synchronize`
  // (which names the constraint differently) don't fail.
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [column, constraint] of [
      ['google_id', 'UQ_users_google_id'],
      ['apple_id', 'UQ_users_apple_id'],
    ]) {
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = '${column}'
          ) THEN
            ALTER TABLE "users" ADD "${column}" character varying;
            ALTER TABLE "users" ADD CONSTRAINT "${constraint}" UNIQUE ("${column}");
          END IF;
        END $$;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_apple_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "apple_id"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_google_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "google_id"`);
  }
}
