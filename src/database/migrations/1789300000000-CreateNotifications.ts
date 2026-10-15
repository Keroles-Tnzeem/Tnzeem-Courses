import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1789300000000 implements MigrationInterface {
  name = 'CreateNotifications1789300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_type_enum') THEN
          CREATE TYPE "notifications_type_enum" AS ENUM ('enrollment_created', 'enrollment_status_changed');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_channel_enum') THEN
          CREATE TYPE "notifications_channel_enum" AS ENUM ('mail', 'in_app');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" character varying(26) NOT NULL,
        "user_id" integer NOT NULL,
        "type" "notifications_type_enum" NOT NULL,
        "channel" "notifications_channel_enum" NOT NULL,
        "title" jsonb NOT NULL,
        "body" jsonb NOT NULL,
        "data" jsonb,
        "read_at" TIMESTAMP,
        "sent_at" TIMESTAMP,
        "failed_reason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_channel_read"
        ON "notifications" ("user_id", "channel", "read_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notifications_channel_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notifications_type_enum"`);
  }
}
