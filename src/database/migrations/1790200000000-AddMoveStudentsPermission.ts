import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMoveStudentsPermission1790200000000
  implements MigrationInterface
{
  name = 'AddMoveStudentsPermission1790200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Insert the 'students.move' permission if it doesn't already exist
    await queryRunner.query(`
      INSERT INTO "permissions" ("name", "module", "description")
      VALUES ('students.move', 'students', '{"en": "Move Students to Another Staff", "ar": "نقل الطلاب إلى موظف آخر"}')
      ON CONFLICT ("name") DO NOTHING;
    `);

    // 2. Attach this permission to all existing ADMIN users
    await queryRunner.query(`
      INSERT INTO "user_permissions" ("user_id", "permission_id")
      SELECT u.id, p.id
      FROM "users" u
      CROSS JOIN "permissions" p
      WHERE u.user_type = 'admin' AND p.name = 'students.move'
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
        SELECT "id" FROM "permissions" WHERE "name" = 'students.move'
      );
    `);

    await queryRunner.query(`
      DELETE FROM "permissions" WHERE "name" = 'students.move';
    `);
  }
}
