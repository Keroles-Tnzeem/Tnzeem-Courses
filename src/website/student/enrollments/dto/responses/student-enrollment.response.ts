import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentEntity } from '../../../../../shared/enrollments/entities/enrollment.entity';
import { EnrollmentStatusEnum } from '../../../../../shared/enrollments/enums/enrollment-status.enum';
import { getTranslatedString } from '../../../../../common/utils/translation.util';

export class StudentEnrollmentCourse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  image?: string;
}

export class StudentEnrollmentRound {
  @ApiProperty()
  id: number;

  @ApiProperty()
  roundNumber: number;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;
}

export class StudentEnrollmentResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: EnrollmentStatusEnum })
  status: EnrollmentStatusEnum;

  @ApiPropertyOptional()
  certificateSerialNum?: string;

  @ApiProperty({ type: StudentEnrollmentCourse, nullable: true })
  course: StudentEnrollmentCourse | null;

  @ApiProperty({ type: StudentEnrollmentRound, nullable: true })
  round: StudentEnrollmentRound | null;

  @ApiProperty()
  createdAt: Date;

  static fromEntity(
    entity: EnrollmentEntity,
    lang: string = 'en',
  ): StudentEnrollmentResponse {
    const response = new StudentEnrollmentResponse();
    response.id = entity.id;
    response.status = entity.status;
    response.certificateSerialNum = entity.certificateSerialNum;
    response.createdAt = entity.audit.createdAt;

    response.course = entity.round?.course
      ? {
          id: entity.round.course.id,
          name: getTranslatedString(entity.round.course.name, lang),
          image: entity.round.course.image,
        }
      : null;

    response.round = entity.round
      ? {
          id: entity.round.id,
          roundNumber: entity.round.roundNumber,
          startDate: entity.round.startDate,
          endDate: entity.round.endDate,
        }
      : null;

    return response;
  }
}
