import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentEntity } from '../../../../../shared/enrollments/entities/enrollment.entity';
import { CourseLevelEnum } from '../../../../../common/enums/course-level.enum';
import { RoundStatusEnum } from '../../../../../staff/staff-dashboard/rounds/enums/round-status.enum';
import { getTranslatedString } from '../../../../../common/utils/translation.util';
import { MeetingStatusEnum } from '../../../../../shared/meetings/enums/meeting-status.enum';
import { MeetingsService } from '../../../../../shared/meetings/meetings.service';
import {
  StudentEnrollmentCourse,
  StudentEnrollmentResponse,
  StudentEnrollmentRound,
} from './student-enrollment.response';

export class StudentEnrollmentCourseDetails extends StudentEnrollmentCourse {
  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  sessionsCount?: number;

  @ApiPropertyOptional()
  durationHours?: number;

  @ApiPropertyOptional({ enum: CourseLevelEnum })
  level?: CourseLevelEnum;
}

export class StudentEnrollmentSession {
  @ApiProperty()
  id: number;

  @ApiProperty()
  sessionNumber: number;

  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  scheduledAt?: Date;

  @ApiPropertyOptional()
  scheduledEnd?: Date | null;

  @ApiProperty()
  timezone: string;

  @ApiPropertyOptional()
  zoomLink?: string | null;

  @ApiProperty()
  isJoinable: boolean;

  @ApiPropertyOptional()
  durationMinutes?: number;

  @ApiProperty({ enum: MeetingStatusEnum })
  meetingStatus: MeetingStatusEnum;

  @ApiPropertyOptional()
  microsoftOnlineMeetingId?: string | null;
}

export class StudentEnrollmentRoundDetails extends StudentEnrollmentRound {
  @ApiPropertyOptional({ enum: RoundStatusEnum })
  status?: RoundStatusEnum;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ type: [StudentEnrollmentSession] })
  sessions: StudentEnrollmentSession[];
}

export class StudentEnrollmentDetailsResponse extends StudentEnrollmentResponse {
  @ApiPropertyOptional()
  orderId?: string;

  @ApiProperty({ type: StudentEnrollmentCourseDetails, nullable: true })
  declare course: StudentEnrollmentCourseDetails | null;

  @ApiProperty({ type: StudentEnrollmentRoundDetails, nullable: true })
  declare round: StudentEnrollmentRoundDetails | null;

  static fromEntity(
    entity: EnrollmentEntity,
    lang: string = 'en',
  ): StudentEnrollmentDetailsResponse {
    const base = StudentEnrollmentResponse.fromEntity(entity, lang);
    const response = Object.assign(
      new StudentEnrollmentDetailsResponse(),
      base,
    );

    response.orderId = entity.orderId;

    response.course = entity.round?.course
      ? {
          id: entity.round.course.id,
          name: getTranslatedString(entity.round.course.name, lang),
          image: entity.round.course.image,
          description: getTranslatedString(
            entity.round.course.description,
            lang,
          ),
          sessionsCount: entity.round.course.sessionsCount,
          durationHours: entity.round.course.durationHours,
          level: entity.round.course.level,
        }
      : null;

    response.round = entity.round
      ? {
          id: entity.round.id,
          roundNumber: entity.round.roundNumber,
          startDate: entity.round.startDate,
          endDate: entity.round.endDate,
          status: entity.round.status,
          notes: entity.round.notes,
          sessions: (entity.round.sessions ?? [])
            .slice()
            .sort((a, b) => a.sessionNumber - b.sessionNumber)
            .map((session) => {
              const effectiveStatus =
                MeetingsService.resolveEffectiveStatus(session);
              const isCancelled =
                effectiveStatus === MeetingStatusEnum.CANCELLED;
              const joinUrl = !isCancelled ? session.zoomLink ?? null : null;

              return {
                id: session.id,
                sessionNumber: session.sessionNumber,
                title: session.title,
                scheduledAt: session.scheduledAt,
                scheduledEnd:
                  session.scheduledEnd ??
                  (session.scheduledAt && session.durationMinutes
                    ? new Date(
                        new Date(session.scheduledAt).getTime() +
                          session.durationMinutes * 60_000,
                      )
                    : null),
                timezone: session.timezone || 'Asia/Riyadh',
                zoomLink: joinUrl,
                isJoinable: Boolean(joinUrl),
                durationMinutes: session.durationMinutes,
                meetingStatus: effectiveStatus,
                microsoftOnlineMeetingId:
                  session.microsoftOnlineMeetingId ?? null,
              };
            }),
        }
      : null;

    return response;
  }
}
