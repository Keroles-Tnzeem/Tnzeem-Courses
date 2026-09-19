import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Strip the leading 0 from stored Saudi mobiles (05xxxxxxxx -> 5xxxxxxxx).
 * Rows whose normalized number already belongs to another user are left
 * untouched so the unique constraint on users.phone is never violated;
 * review those manually.
 */
export class NormalizeUserPhones1789100000001 implements MigrationInterface {
  name = 'NormalizeUserPhones1789100000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users" u
      SET "phone" = substr(u."phone", 2)
      WHERE u."phone" ~ '^05[0-9]{8}$'
        AND NOT EXISTS (
          SELECT 1 FROM "users" o WHERE o."phone" = substr(u."phone", 2)
        )
    `);
  }

  public async down(): Promise<void> {
    // Not reversible: the original leading zeros are not recorded.
  }
}
