import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoundSessionEntity } from '../../entities/round-session.entity';

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
    zoomLink: string;

    @ApiPropertyOptional()
    durationMinutes: number;

    @ApiPropertyOptional()
    notes: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static from(entity: RoundSessionEntity): RoundSessionResponse {
        const response = new RoundSessionResponse();
        response.id = entity.id;
        response.roundId = entity.roundId;
        response.sessionNumber = entity.sessionNumber;
        response.title = entity.title;
        response.scheduledAt = entity.scheduledAt;
        response.zoomLink = entity.zoomLink;
        response.durationMinutes = entity.durationMinutes;
        response.notes = entity.notes;
        response.createdAt = entity.audit.createdAt;
        response.updatedAt = entity.audit.updatedAt;
        return response;
    }
}
