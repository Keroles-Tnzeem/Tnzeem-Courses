import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderNotificationTypes1789300000002 implements MigrationInterface {
  name = 'AddOrderNotificationTypes1789300000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'order_created'`,
    );
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'order_payment_completed'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres cannot drop a single enum value; left in place intentionally.
  }
}
