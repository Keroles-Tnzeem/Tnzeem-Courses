import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreateInvoicePermission1789900000000 implements MigrationInterface {
  name = 'AddCreateInvoicePermission1789900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Insert the 'invoices.create' permission if it doesn't already exist
    await queryRunner.query(`
      INSERT INTO "permissions" ("name", "module", "description")
      VALUES ('invoices.create', 'invoices', '{"en": "Create Invoice", "ar": "إنشاء فاتورة"}')
      ON CONFLICT ("name") DO NOTHING;
    `);

    // 2. Attach this permission to all existing ADMIN users
    await queryRunner.query(`
      INSERT INTO "user_permissions" ("user_id", "permission_id")
      SELECT u.id, p.id
      FROM "users" u
      CROSS JOIN "permissions" p
      WHERE u.user_type = 'admin' AND p.name = 'invoices.create'
        AND NOT EXISTS (
          SELECT 1 FROM "user_permissions" up
          WHERE up.user_id = u.id AND up.permission_id = p.id
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "user_permissions"
      WHERE "permission_id" IN (
        SELECT "id" FROM "permissions" WHERE "name" = 'invoices.create'
      );
    `);

    await queryRunner.query(`
      DELETE FROM "permissions" WHERE "name" = 'invoices.create';
    `);
  }
}
