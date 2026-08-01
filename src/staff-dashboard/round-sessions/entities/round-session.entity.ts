import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { RoundEntity } from '../../rounds/entities/round.entity';

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

    @Column({ name: 'zoom_link', type: 'varchar', length: 500, nullable: true })
    zoomLink: string;

    @Column({ name: 'duration_minutes', type: 'int', nullable: true })
    durationMinutes: number;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => RoundEntity, (round) => round.sessions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'round_id' })
    round: RoundEntity;

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;
}
