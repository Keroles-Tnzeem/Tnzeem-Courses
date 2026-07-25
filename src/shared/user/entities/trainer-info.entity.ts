import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { UserEntity } from './user.entity';
import { AuditColumns } from '../../../common/entities/audit-columns';

@Entity('trainer_info')
export class TrainerInfoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @OneToOne(() => UserEntity, user => user.trainerInfo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ type: 'int', nullable: true })
    age: number;

    @Column({ name: 'num_experience', type: 'int', nullable: true })
    numExperience: number;

    @Column({ type: 'text', nullable: true })
    experience: string;

    @Column({ name: 'num_courses', type: 'int', default: 0 })
    numCourses: number;

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;
}
