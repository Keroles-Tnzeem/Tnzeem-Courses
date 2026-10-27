import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToUsers1789700000000 implements MigrationInterface {
  name = 'AddStatusToUsers1789700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_status_enum') THEN
          CREATE TYPE "users_status_enum" AS ENUM (
            'PENDING',
            'CONFIRMED',
            'CANCELLED',
            'NO_RESPONSE_1',
            'NO_RESPONSE_2',
            'NO_RESPONSE_3',
            'NO_RESPONSE_4'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "status" "users_status_enum" NOT NULL DEFAULT 'PENDING'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "status"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "users_status_enum"`);
  }
}
