import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AuditColumns } from '../../../../common/entities/audit-columns';
import { OtpPurposeEnum } from '../enums/otp-purpose.enum';

@Entity('student_otps')
export class OtpEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  phone: string;

  @Column({ type: 'enum', enum: OtpPurposeEnum })
  purpose: OtpPurposeEnum;

  @Column()
  code: string; // hashed (bcrypt)

  @Column({ default: 0 })
  attempts: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt: Date | null;

  @Column(() => AuditColumns, { prefix: false })
  audit: AuditColumns;
}
