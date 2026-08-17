import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { OrderEntity } from '../../../shared/orders/entities/order.entity';
import { UserEntity } from '../../../shared/user/entities/user.entity';

@Entity('order_comments')
export class OrderCommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'order_id' })
    orderId: string;

    @Column({ name: 'staff_id' })
    staffId: number;

    @Column({ type: 'text' })
    comment: string;

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;

    // Relations 

    @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'staff_id' })
    staff: UserEntity;
}
