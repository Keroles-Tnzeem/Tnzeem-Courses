import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoundEntity } from '../../entities/round.entity';
import { RoundStatusEnum } from '../../enums/round-status.enum';

export class RoundResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    courseId: number;

    @ApiPropertyOptional()
    courseName?: string;

    @ApiProperty()
    roundNumber: number;

    @ApiPropertyOptional()
    startDate: Date;

    @ApiPropertyOptional()
    endDate: Date;

    @ApiProperty({ enum: RoundStatusEnum })
    status: RoundStatusEnum;

    @ApiPropertyOptional()
    notes: string;

    @ApiProperty()
    showRound: boolean;

    @ApiProperty()
    sessionsCount: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    static from(entity: RoundEntity, lang: string = 'en'): RoundResponse {
        const response = new RoundResponse();
        response.id = entity.id;
        response.courseId = entity.courseId;
        response.courseName = entity.course?.name?.[lang] ?? undefined;
        response.roundNumber = entity.roundNumber;
        response.startDate = entity.startDate;
        response.endDate = entity.endDate;
        response.status = entity.status;
        response.notes = entity.notes;
        response.showRound = entity.showRound;
        response.sessionsCount = entity.sessions?.length ?? 0;
        response.createdAt = entity.audit.createdAt;
        response.updatedAt = entity.audit.updatedAt;
        return response;
    }
}
