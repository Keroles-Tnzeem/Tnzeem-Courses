import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { UserEntity } from '../../user/entities/user.entity';
import { RoundEntity } from '../../../staff-dashboard/rounds/entities/round.entity';
import { CourseEntity } from '../../../staff-dashboard/courses/entities/course.entity';
import { OrderStatusEnum } from '../enums/order-status.enum';
import { PaymentTypeEnum } from '../../payment/enums/payment-type.enum';
import { PaymentMethodEnum } from '../../payment/enums/payment-method.enum';
import { PaymentStatusEnum } from '../../payment/enums/payment-status.enum';
import { OrderCreatorTypeEnum } from '../enums/order-creator-type.enum';
import { generateUlid } from '../../../common/helpers/ulid.helper';

@Entity('orders')
export class OrderEntity {
    @PrimaryColumn('varchar', { length: 26 })
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = generateUlid();
        }
    }

    // ── Foreign Keys
    @Column({ name: 'student_id' })
    studentId: number;

    @Column({ name: 'round_id' })
    roundId: number;

    @Column({ name: 'course_id', nullable: true })
    courseId: number;

    @Column({ name: 'trainer_id' })
    trainerId: number;

    @Column({ name: 'assign_to_id', nullable: true })
    assignToId: number;

    // ── Price Snapshot 
    // Prices are stored at order creation time so future course price
    // changes do not affect existing orders.

    @Column({ name: 'main_price', type: 'decimal', precision: 10, scale: 2 })
    mainPrice: number;

    @Column({ name: 'price_after_discount', type: 'decimal', precision: 10, scale: 2 })
    priceAfterDiscount: number;

    @Column({ name: 'final_price', type: 'decimal', precision: 10, scale: 2 })
    finalPrice: number;

    // ── Status

    @Column({ name: 'has_enrollment', type: 'boolean', default: false })
    hasEnrollment: boolean;

    @Column({
        type: 'enum',
        enum: OrderStatusEnum,
        default: OrderStatusEnum.PENDING,
    })
    status: OrderStatusEnum;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    // ── Payment Information

    @Column({ name: 'payment_type', type: 'enum', enum: PaymentTypeEnum, nullable: true })
    paymentType?: PaymentTypeEnum;

    @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethodEnum, nullable: true })
    paymentMethod?: PaymentMethodEnum;

    @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatusEnum, nullable: true })
    paymentStatus?: PaymentStatusEnum;

    @Column({ name: 'payment_reference', type: 'varchar', nullable: true })
    paymentReference?: string;

    @Column({ name: 'payment_notes', type: 'text', nullable: true })
    paymentNotes?: string;

    @Column({ name: 'payment_metadata', type: 'simple-json', nullable: true })
    paymentMetadata?: any;

    @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
    paidAt?: Date;

    @Column({ name: 'payment_callback_data', type: 'simple-json', nullable: true })
    paymentCallbackData?: any;

    @Column({ name: 'transfer_bank_img', type: 'varchar', nullable: true })
    transferBankImg?: string;

    // ── Creation Tracking 

    @Column({
        name: 'created_by',
        type: 'enum',
        enum: OrderCreatorTypeEnum,
        default: OrderCreatorTypeEnum.SYSTEM,
    })
    createdBy: OrderCreatorTypeEnum;

    @Column({ name: 'created_by_id', nullable: true })
    createdById?: number;

    @Column({ name: 'last_comment_id', nullable: true })
    lastCommentId?: number;

    @Column({ name: 'last_comment_date', type: 'timestamp', nullable: true })
    lastCommentDate?: Date;

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

    @ManyToOne(() => CourseEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'course_id' })
    course: CourseEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'trainer_id' })
    trainer: UserEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'created_by_id' })
    creator?: UserEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'assign_to_id' })
    assignTo?: UserEntity;
}
