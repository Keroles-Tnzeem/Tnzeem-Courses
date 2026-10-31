import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackingStatusToOrdersAndUsers1789800000000
  implements MigrationInterface
{
  name = 'AddTrackingStatusToOrdersAndUsers1789800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "orders_status_enum" ADD VALUE IF NOT EXISTS 'TRACKING'`,
    );
    await queryRunner.query(
      `ALTER TYPE "users_status_enum" ADD VALUE IF NOT EXISTS 'TRACKING'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres cannot remove values from an existing enum type
  }
}
