import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdempotencyKeys1789200000000 implements MigrationInterface {
  name = 'CreateIdempotencyKeys1789200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'idempotency_keys_status_enum') THEN
          CREATE TYPE "idempotency_keys_status_enum" AS ENUM ('PROCESSING', 'COMPLETED');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "idempotency_keys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" character varying(255) NOT NULL,
        "scope" character varying(150) NOT NULL,
        "user_id" integer,
        "status" "idempotency_keys_status_enum" NOT NULL DEFAULT 'PROCESSING',
        "response_status_code" integer,
        "response_body" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_idempotency_keys" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_idempotency_key_scope'
        ) THEN
          ALTER TABLE "idempotency_keys"
            ADD CONSTRAINT "UQ_idempotency_key_scope" UNIQUE ("key", "scope");
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "idempotency_keys"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "idempotency_keys_status_enum"`);
  }
}
