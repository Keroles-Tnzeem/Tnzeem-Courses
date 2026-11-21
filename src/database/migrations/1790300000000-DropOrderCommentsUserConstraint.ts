import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropOrderCommentsUserConstraint1790300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_comments" DROP CONSTRAINT IF EXISTS "FK_f75ed43c834262bc11c33776088"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_comments" ADD CONSTRAINT "FK_f75ed43c834262bc11c33776088"
      FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }
}
