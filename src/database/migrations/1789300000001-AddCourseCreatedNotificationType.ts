import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseCreatedNotificationType1789300000001 implements MigrationInterface {
  name = 'AddCourseCreatedNotificationType1789300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "notifications_type_enum" ADD VALUE IF NOT EXISTS 'course_created'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres cannot drop a single enum value; left in place intentionally.
  }
}
