import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeamsFieldsToRoundSessions1790000000000 implements MigrationInterface {
  name = 'AddTeamsFieldsToRoundSessions1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'round_sessions_meeting_status_enum') THEN
          CREATE TYPE "round_sessions_meeting_status_enum" AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'round_sessions_sync_status_enum') THEN
          CREATE TYPE "round_sessions_sync_status_enum" AS ENUM ('pending', 'synced', 'failed', 'cancelled');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "round_sessions"
        ALTER COLUMN "zoom_link" TYPE character varying(1000),
        ADD COLUMN IF NOT EXISTS "scheduled_end" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "timezone" character varying(100) NOT NULL DEFAULT 'Asia/Riyadh',
        ADD COLUMN IF NOT EXISTS "microsoft_event_id" character varying(500),
        ADD COLUMN IF NOT EXISTS "microsoft_online_meeting_id" character varying(500),
        ADD COLUMN IF NOT EXISTS "organizer_user_id" character varying(255),
        ADD COLUMN IF NOT EXISTS "meeting_status" "round_sessions_meeting_status_enum" NOT NULL DEFAULT 'scheduled',
        ADD COLUMN IF NOT EXISTS "sync_status" "round_sessions_sync_status_enum",
        ADD COLUMN IF NOT EXISTS "sync_error" text,
        ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_round_sessions_microsoft_event_id"
        ON "round_sessions" ("microsoft_event_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_round_sessions_microsoft_event_id";
    `);

    await queryRunner.query(`
      ALTER TABLE "round_sessions"
        DROP COLUMN IF EXISTS "last_synced_at",
        DROP COLUMN IF EXISTS "sync_error",
        DROP COLUMN IF EXISTS "sync_status",
        DROP COLUMN IF EXISTS "meeting_status",
        DROP COLUMN IF EXISTS "organizer_user_id",
        DROP COLUMN IF EXISTS "microsoft_online_meeting_id",
        DROP COLUMN IF EXISTS "microsoft_event_id",
        DROP COLUMN IF EXISTS "timezone",
        DROP COLUMN IF EXISTS "scheduled_end";
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "round_sessions_sync_status_enum";
      DROP TYPE IF EXISTS "round_sessions_meeting_status_enum";
    `);
  }
}

