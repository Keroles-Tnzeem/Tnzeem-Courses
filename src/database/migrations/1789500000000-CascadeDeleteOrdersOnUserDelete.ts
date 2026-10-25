import { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadeDeleteOrdersOnUserDelete1789500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Cascade delete orders when student user is deleted
    await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_6c846a094b1989e1a202558803b"
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_6c846a094b1989e1a202558803b"
      FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 2. Cascade delete enrollments when student user is deleted
    await queryRunner.query(`
      ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "FK_307813fe255896d6ebf3e6cd55c"
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments" ADD CONSTRAINT "FK_307813fe255896d6ebf3e6cd55c"
      FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // 3. Set assign_to_id to NULL if assigned staff user is deleted
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_b7045841f41fb3fc377259a48af"
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_b7045841f41fb3fc377259a48af"
      FOREIGN KEY ("assign_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 4. Set created_by_id in orders to NULL if creator staff user is deleted
    await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_f93cc7892226abb9c88e7131381"
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_f93cc7892226abb9c88e7131381"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_6c846a094b1989e1a202558803b"
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_6c846a094b1989e1a202558803b"
      FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "FK_307813fe255896d6ebf3e6cd55c"
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments" ADD CONSTRAINT "FK_307813fe255896d6ebf3e6cd55c"
      FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_b7045841f41fb3fc377259a48af"
    `);
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_b7045841f41fb3fc377259a48af"
      FOREIGN KEY ("assign_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_f93cc7892226abb9c88e7131381"
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_f93cc7892226abb9c88e7131381"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }
}
