import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Converts notifications.id from varchar (ULID) to an auto-increment integer.
 * Only acts when the column is still varchar, so it is a no-op on databases
 * where CreateNotifications already created the integer id.
 */
export class ConvertNotificationsIdToInteger1789300000003 implements MigrationInterface {
  name = 'ConvertNotificationsIdToInteger1789300000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF (
          SELECT data_type FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'notifications' AND column_name = 'id'
        ) = 'character varying' THEN
          ALTER TABLE "notifications" ADD COLUMN "new_id" integer;

          -- keep chronological order when numbering existing rows
          UPDATE "notifications" n SET "new_id" = s.rn
          FROM (
            SELECT "id", row_number() OVER (ORDER BY "created_at", "id") AS rn
            FROM "notifications"
          ) s
          WHERE n."id" = s."id";

          -- dropping the column also drops its primary key
          ALTER TABLE "notifications" DROP COLUMN "id";
          ALTER TABLE "notifications" RENAME COLUMN "new_id" TO "id";
          ALTER TABLE "notifications" ALTER COLUMN "id" SET NOT NULL;
          ALTER TABLE "notifications" ADD CONSTRAINT "PK_notifications" PRIMARY KEY ("id");

          CREATE SEQUENCE IF NOT EXISTS "notifications_id_seq" OWNED BY "notifications"."id";
          PERFORM setval(
            'notifications_id_seq',
            COALESCE((SELECT MAX("id") FROM "notifications"), 0) + 1,
            false
          );
          ALTER TABLE "notifications" ALTER COLUMN "id" SET DEFAULT nextval('notifications_id_seq');
        END IF;
      END $$;
    `);
  }

  public async down(): Promise<void> {
    // Not reversible: the original ULIDs are discarded.
  }
}
