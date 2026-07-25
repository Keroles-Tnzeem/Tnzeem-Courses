import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { UserEntity } from './user.entity';

@Entity('students')
export class StudentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @OneToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;
}
