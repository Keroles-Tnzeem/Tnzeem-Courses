import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoundSessionEntity } from '../../entities/round-session.entity';
import { MeetingStatusEnum } from '../../../../../shared/meetings/enums/meeting-status.enum';
import { MeetingSyncStatusEnum } from '../../../../../shared/meetings/enums/meeting-sync-status.enum';
import { MeetingsService } from '../../../../../shared/meetings/meetings.service';

export class RoundSessionResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    roundId: number;

    @ApiProperty()
    sessionNumber: number;

    @ApiPropertyOptional()
    title: string;

    @ApiPropertyOptional()
    scheduledAt: Date;

    @ApiPropertyOptional()
    scheduledEnd?: Date | null;

    @ApiProperty()
    timezone: string;

    @ApiPropertyOptional()
    zoomLink: string;

    @ApiProperty()
    isJoinable: boolean;

    @ApiPropertyOptional()
    durationMinutes: number;

    @ApiPropertyOptional()
    notes: string;

    @ApiProperty({ enum: MeetingStatusEnum })
    meetingStatus: MeetingStatusEnum;

    @ApiPropertyOptional({ enum: MeetingSyncStatusEnum, nullable: true })
    syncStatus?: MeetingSyncStatusEnum | null;

    @ApiPropertyOptional()
    syncError?: string | null;

    @ApiPropertyOptional()
    microsoftEventId?: string | null;

    @ApiPropertyOptional()
    microsoftOnlineMeetingId?: string | null;

    @ApiPropertyOptional()
    organizerUserId?: string | null;

    @ApiPropertyOptional()
    lastSyncedAt?: Date | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static from(entity: RoundSessionEntity): RoundSessionResponse {
        const response = new RoundSessionResponse();
        const effectiveStatus = MeetingsService.resolveEffectiveStatus(entity);
        const isCancelled = effectiveStatus === MeetingStatusEnum.CANCELLED;

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
        response.zoomLink = !isCancelled ? entity.zoomLink : (null as unknown as string);
        response.isJoinable = Boolean(!isCancelled && entity.zoomLink);
        response.durationMinutes = entity.durationMinutes;
        response.notes = entity.notes;
        response.meetingStatus = effectiveStatus;
        response.syncStatus = entity.syncStatus ?? null;
        response.syncError = entity.syncError ?? null;
        response.microsoftEventId = entity.microsoftEventId ?? null;
        response.microsoftOnlineMeetingId =
            entity.microsoftOnlineMeetingId ?? null;
        response.organizerUserId = entity.organizerUserId ?? null;
        response.lastSyncedAt = entity.lastSyncedAt ?? null;
        response.createdAt = entity.audit?.createdAt;
        response.updatedAt = entity.audit?.updatedAt;
        return response;
    }
}
