import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCourseIdToOrders1785938867074 implements MigrationInterface {
    name = 'AddCourseIdToOrders1785938867074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "students" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "user_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_25985d58c714a4a427ced57507b" UNIQUE ("email"), CONSTRAINT "REL_fb3eff90b11bddf7285f9b4e28" UNIQUE ("user_id"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        // The course_id column was already added manually or in a previous step, so we skip it here:
        // await queryRunner.query(`ALTER TABLE "orders" ADD "course_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        // The foreign key constraint for course_id also already exists:
        // await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_8f64e2f0728bad0f6c6aa6413b2" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_8f64e2f0728bad0f6c6aa6413b2"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "course_id"`);
        await queryRunner.query(`DROP TABLE "students"`);
    }

}
