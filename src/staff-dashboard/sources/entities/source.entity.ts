import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditColumns } from '../../../common/entities/audit-columns';

@Entity('sources')
export class SourceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column(() => AuditColumns, { prefix: false })
  audit: AuditColumns;
}