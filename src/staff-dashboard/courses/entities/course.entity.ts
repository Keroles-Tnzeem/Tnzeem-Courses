import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { CourseStatusEnum } from '../enums/course-status.enum';
import { AuditColumns } from '../../../common/entities/audit-columns';
import { TrainerInfoEntity } from '../../../shared/user/entities/trainer-info.entity';
import { CourseCategoryEntity } from '../../course-categories/entities/course-category.entity';
import { CourseLevelEnum } from '../../../shared/enums/course-level.enum';

@Entity('courses')
export class CourseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'trainer_id' })
    trainerId: number;

    @Column({ name: 'category_id' })
    categoryId: number;

    @Column({ type: 'jsonb' })
    name: { ar: string; en: string };

    @Column({ type: 'jsonb' })
    description: { ar: string; en: string };

    @Column({ type: 'text', nullable: true })
    requirements?: string;

    @Column({ type: 'text', nullable: true })
    benefits?: string;

    @Column({ unique: true, nullable: true })
    slug: string;

    @Column({ name: 'image', type: 'varchar', length: 500, nullable: true })
    image: string;

    @Column({ name: 'intro_video', type: 'varchar', length: 500, nullable: true })
    introVideo: string;

    @Column({ name: 'sessions_count', type: 'int', default: 0 })
    sessionsCount: number;

    @Column({ name: 'duration_hours', type: 'int', default: 0 })
    durationHours: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;

    @Column({ type: 'enum', enum: CourseStatusEnum, default: CourseStatusEnum.PENDING })
    status: CourseStatusEnum;

    @Column({ type: 'enum', enum: CourseLevelEnum, default: CourseLevelEnum.INTRODUCTORY })
    level: CourseLevelEnum;

    @ManyToOne(() => TrainerInfoEntity)
    @JoinColumn({ name: 'trainer_id' })
    trainer: TrainerInfoEntity;

    @ManyToOne(() => CourseCategoryEntity)
    @JoinColumn({ name: 'category_id' })
    category: CourseCategoryEntity;

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date;
}
