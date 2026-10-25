import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetNullOnTrainerDeleteInCoursesAndOrders1789600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Make trainer_id nullable in courses and set foreign key to ON DELETE SET NULL
    await queryRunner.query(`
      ALTER TABLE "courses" ALTER COLUMN "trainer_id" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "FK_7067b4b68f5fece5acd35e78e8b"
    `);
    await queryRunner.query(`
      ALTER TABLE "courses" ADD CONSTRAINT "FK_7067b4b68f5fece5acd35e78e8b"
      FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 2. Make trainer_id nullable in orders and set foreign key to ON DELETE SET NULL
    await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "trainer_id" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_7374f45fe4a43db848cf0505967"
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_7374f45fe4a43db848cf0505967"
      FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_7374f45fe4a43db848cf0505967"
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_7374f45fe4a43db848cf0505967"
      FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "trainer_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "FK_7067b4b68f5fece5acd35e78e8b"
    `);
    await queryRunner.query(`
      ALTER TABLE "courses" ADD CONSTRAINT "FK_7067b4b68f5fece5acd35e78e8b"
      FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "courses" ALTER COLUMN "trainer_id" SET NOT NULL
    `);
  }
}
