import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditColumns } from '../../../../common/entities/audit-columns';
import { RoundEntity } from '../../rounds/entities/round.entity';
import { MeetingStatusEnum } from '../../../../shared/meetings/enums/meeting-status.enum';
import { MeetingSyncStatusEnum } from '../../../../shared/meetings/enums/meeting-sync-status.enum';

@Entity('round_sessions')
export class RoundSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'round_id' })
  roundId: number;

  @Column({ name: 'session_number', type: 'int' })
  sessionNumber: number;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'scheduled_end', type: 'timestamp', nullable: true })
  scheduledEnd?: Date | null;

  @Column({
    name: 'timezone',
    type: 'varchar',
    length: 100,
    default: 'Asia/Riyadh',
  })
  timezone: string;

  @Column({ name: 'zoom_link', type: 'varchar', length: 1000, nullable: true })
  zoomLink: string;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Index('IDX_round_sessions_microsoft_event_id')
  @Column({
    name: 'microsoft_event_id',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  microsoftEventId?: string | null;

  @Column({
    name: 'microsoft_online_meeting_id',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  microsoftOnlineMeetingId?: string | null;

  @Column({
    name: 'organizer_user_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  organizerUserId?: string | null;

  @Column({
    name: 'meeting_status',
    type: 'enum',
    enum: MeetingStatusEnum,
    enumName: 'round_sessions_meeting_status_enum',
    default: MeetingStatusEnum.SCHEDULED,
  })
  meetingStatus: MeetingStatusEnum;

  @Column({
    name: 'sync_status',
    type: 'enum',
    enum: MeetingSyncStatusEnum,
    enumName: 'round_sessions_sync_status_enum',
    nullable: true,
  })
  syncStatus?: MeetingSyncStatusEnum | null;

  @Column({ name: 'sync_error', type: 'text', nullable: true })
  syncError?: string | null;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt?: Date | null;

  @ManyToOne(() => RoundEntity, (round) => round.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'round_id' })
  round: RoundEntity;

  @Column(() => AuditColumns, { prefix: false })
  audit: AuditColumns;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
