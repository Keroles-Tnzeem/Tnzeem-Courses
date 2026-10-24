import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoResponseOrderStatuses1789400000000 implements MigrationInterface {
  name = 'AddNoResponseOrderStatuses1789400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "orders_status_enum" ADD VALUE IF NOT EXISTS 'NO_RESPONSE_1'`,
    );
    await queryRunner.query(
      `ALTER TYPE "orders_status_enum" ADD VALUE IF NOT EXISTS 'NO_RESPONSE_2'`,
    );
    await queryRunner.query(
      `ALTER TYPE "orders_status_enum" ADD VALUE IF NOT EXISTS 'NO_RESPONSE_3'`,
    );
    await queryRunner.query(
      `ALTER TYPE "orders_status_enum" ADD VALUE IF NOT EXISTS 'NO_RESPONSE_4'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres cannot remove values from an existing enum type
  }
}
