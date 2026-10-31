import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWhatsappNotificationChannel1789300000004 implements MigrationInterface {
  name = 'AddWhatsappNotificationChannel1789300000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "notifications_channel_enum" ADD VALUE IF NOT EXISTS 'whatsapp'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres cannot drop a single enum value; left in place intentionally.
  }
}
