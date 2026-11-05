import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRepeatedStatusToOrdersAndUsers1790100000000
  implements MigrationInterface
{
  name = 'AddRepeatedStatusToOrdersAndUsers1790100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "orders_status_enum" ADD VALUE IF NOT EXISTS 'REPEATED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "users_status_enum" ADD VALUE IF NOT EXISTS 'REPEATED'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres cannot remove values from an existing enum type
  }
}

