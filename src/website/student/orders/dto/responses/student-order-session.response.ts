import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoundSessionEntity } from '../../../../../staff/staff-dashboard/round-sessions/entities/round-session.entity';
import { MeetingStatusEnum } from '../../../../../shared/meetings/enums/meeting-status.enum';
import { MeetingsService } from '../../../../../shared/meetings/meetings.service';

export class StudentOrderSessionResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  roundId: number;

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

  @ApiPropertyOptional()
  durationMinutes?: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty({ enum: MeetingStatusEnum })
  meetingStatus: MeetingStatusEnum;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;

  static fromEntity(entity: RoundSessionEntity): StudentOrderSessionResponse {
    const response = new StudentOrderSessionResponse();
    const effectiveStatus = MeetingsService.resolveEffectiveStatus(entity);
    const isCancelled = effectiveStatus === MeetingStatusEnum.CANCELLED;
    const joinUrl = !isCancelled ? entity.zoomLink ?? null : null;

    response.id = entity.id;
    response.roundId = entity.roundId;
    response.sessionNumber = entity.sessionNumber;
    response.title = entity.title;
    response.scheduledAt = entity.scheduledAt;
    response.scheduledEnd =
      entity.scheduledEnd ??
      (entity.scheduledAt && entity.durationMinutes
        ? new Date(
            new Date(entity.scheduledAt).getTime() +
              entity.durationMinutes * 60_000,
          )
        : null);
    response.timezone = entity.timezone || 'Asia/Riyadh';
    response.zoomLink = joinUrl;
    response.durationMinutes = entity.durationMinutes;
    response.notes = entity.notes;
    response.meetingStatus = effectiveStatus;
    response.createdAt = entity.audit?.createdAt;
    response.updatedAt = entity.audit?.updatedAt;
    return response;
  }
}

