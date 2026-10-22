import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { CourseEntity } from '../../../staff/staff-dashboard/courses/entities/course.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { InquiryStatusEnum } from '../enums/inquiry-status.enum';

@Entity('inquiries')
export class InquiryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  phone: string;

  @Column({ name: 'course_id', nullable: false })
  courseId: number;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /** Linked once a student registers/updates their phone to match this inquiry. */
  @Column({ name: 'student_id', nullable: true })
  studentId: number | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student_id' })
  student: UserEntity | null;

  @Column({
    type: 'enum',
    enum: InquiryStatusEnum,
    default: InquiryStatusEnum.PENDING,
  })
  status: InquiryStatusEnum;

  @Column(() => AuditColumns, { prefix: false })
  audit: AuditColumns;
}
