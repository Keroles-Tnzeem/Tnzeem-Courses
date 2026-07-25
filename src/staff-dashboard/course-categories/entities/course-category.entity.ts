import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';

@Entity('course_categories')
export class CourseCategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'json' })
    name: { ar: string; en: string };

    @Column({ type: 'json' })
    description: { ar: string; en: string };

    @Column({ nullable: true })
    image: string;

    @Column({ name: 'courses_num', default: 0 })
    coursesNum: number;

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;
}
