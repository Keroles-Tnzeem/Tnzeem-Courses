import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSocialLoginIdsToUsers1789000000000 implements MigrationInterface {
  name = 'AddSocialLoginIdsToUsers1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "google_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "apple_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_apple_id" UNIQUE ("apple_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_apple_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "apple_id"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_google_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
  }
}
