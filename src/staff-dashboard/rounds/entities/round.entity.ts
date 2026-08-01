import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { CourseEntity } from '../../courses/entities/course.entity';
import { RoundStatusEnum } from '../enums/round-status.enum';
import { RoundSessionEntity } from '../../round-sessions/entities/round-session.entity';

@Entity('rounds')
export class RoundEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'course_id' })
    courseId: number;

    @Column({ name: 'round_number', type: 'int' })
    roundNumber: number;

    @Column({ name: 'start_date', type: 'date', nullable: true })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: RoundStatusEnum,
        default: RoundStatusEnum.UPCOMING,
    })
    status: RoundStatusEnum;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'show_round', type: 'boolean', default: true })
    showRound: boolean;

    @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_id' })
    course: CourseEntity;

    @OneToMany(() => RoundSessionEntity, (session) => session.round)
    sessions: RoundSessionEntity[];

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;
}
