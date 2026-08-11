import {
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    Unique,
} from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { UserEntity } from '../../user/entities/user.entity';
import { RoundEntity } from '../../../staff-dashboard/rounds/entities/round.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { EnrollmentStatusEnum } from '../enums/enrollment-status.enum';
import { generateUlid } from '../../../common/helpers/ulid.helper';

@Entity('enrollments')
@Unique('UQ_enrollment_student_round', ['studentId', 'roundId'])
export class EnrollmentEntity {
    @PrimaryColumn('varchar', { length: 26 })
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = generateUlid();
        }
    }

    // Foreign Keys
    @Column({ name: 'student_id' })
    studentId: number;

    @Column({ name: 'round_id' })
    roundId: number;

    @Column({ name: 'order_id', type: 'varchar', length: 26, nullable: true })
    orderId?: string;

    // Status 
    @Column({
        type: 'enum',
        enum: EnrollmentStatusEnum,
        default: EnrollmentStatusEnum.PENDING,
    })
    status: EnrollmentStatusEnum;

    // Certificate 
    @Column({ name: 'certificate_serial_num', type: 'varchar', nullable: true, unique: true })
    certificateSerialNum?: string;


    // Timestamps 
    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;


    // Relations
    @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'student_id' })
    student: UserEntity;

    @ManyToOne(() => RoundEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'round_id' })
    round: RoundEntity;

    @ManyToOne(() => OrderEntity, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'order_id' })
    order?: OrderEntity;
}
