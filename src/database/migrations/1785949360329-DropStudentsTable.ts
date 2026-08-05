import { MigrationInterface, QueryRunner } from "typeorm";

export class DropStudentsTable1785949360329 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "students" CASCADE');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
