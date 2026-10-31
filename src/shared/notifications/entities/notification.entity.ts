import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { UserEntity } from '../../user/entities/user.entity';
import { NotificationChannelEnum } from '../enums/notification-channel.enum';
import { NotificationTypeEnum } from '../enums/notification-type.enum';

@Entity('notifications')
@Index('IDX_notifications_user_channel_read', ['userId', 'channel', 'readAt'])
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ type: 'enum', enum: NotificationTypeEnum })
  type: NotificationTypeEnum;

  @Column({ type: 'enum', enum: NotificationChannelEnum })
  channel: NotificationChannelEnum;

  // Translatable content: { ar, en }
  @Column({ type: 'jsonb' })
  title: Record<string, string>;

  @Column({ type: 'jsonb' })
  body: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, unknown> | null;

  // In-app only
  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date | null;

  // Mail delivery time
  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date | null;

  @Column({ name: 'failed_reason', type: 'text', nullable: true })
  failedReason?: string | null;

  @Column(() => AuditColumns, { prefix: false })
  audit: AuditColumns;
}
