import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryEntity } from '../../../../../shared/inquiries/entities/inquiry.entity';
import { InquiryStatusEnum } from '../../../../../shared/inquiries/enums/inquiry-status.enum';

export class InquiryResponse {
  @ApiProperty() id: number;
  @ApiProperty() phone: string;
  @ApiProperty() courseId: number;
  @ApiPropertyOptional() notes: string | null;
  @ApiPropertyOptional() studentId: number | null;
  @ApiProperty({ enum: InquiryStatusEnum }) status: InquiryStatusEnum;
  @ApiProperty() createdAt: Date;

  static from(entity: InquiryEntity): InquiryResponse {
    const res = new InquiryResponse();
    res.id = entity.id;
    res.phone = entity.phone;
    res.courseId = entity.courseId;
    res.notes = entity.notes ?? null;
    res.studentId = entity.studentId ?? null;
    res.status = entity.status;
    res.createdAt = entity.audit.createdAt;
    return res;
  }
}
