import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryEntity } from '../../../../../shared/inquiries/entities/inquiry.entity';
import { InquiryStatusEnum } from '../../../../../shared/inquiries/enums/inquiry-status.enum';
import { parseJson } from '../../../../../common/helpers/parse-json.helper';

export class StaffInquiryResponse {
  @ApiProperty() id: number;
  @ApiProperty() phone: string;
  @ApiProperty() courseId: number;
  @ApiPropertyOptional() notes: string | null;
  @ApiPropertyOptional() studentId: number | null;
  @ApiProperty({ enum: InquiryStatusEnum }) status: InquiryStatusEnum;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;

  @ApiPropertyOptional({ description: 'Linked student basic info' })
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string | null;
  } | null;

  @ApiPropertyOptional({
    description: 'Course basic info in the current language',
  })
  course?: {
    id: number;
    name: string;
  } | null;

  static from(entity: InquiryEntity, lang = 'en'): StaffInquiryResponse {
    const res = new StaffInquiryResponse();

    res.id = entity.id;
    res.phone = entity.phone;
    res.courseId = entity.courseId;
    res.notes = entity.notes ?? null;
    res.studentId = entity.studentId ?? null;
    res.status = entity.status;
    res.createdAt = entity.audit.createdAt;
    res.updatedAt = entity.audit.updatedAt;

    if (entity.student) {
      res.student = {
        id: entity.student.id,
        firstName: entity.student.firstName,
        lastName: entity.student.lastName,
        phone: entity.student.phone ?? null,
        email: entity.student.email ?? null,
      };
    } else {
      res.student = null;
    }

    if (entity.course) {
      const nameObj = parseJson<Record<string, string>>(entity.course.name);

      res.course = {
        id: entity.course.id,
        name: nameObj?.[lang] ?? nameObj?.['en'] ?? '',
      };
    } else {
      res.course = null;
    }

    return res;
  }
}
