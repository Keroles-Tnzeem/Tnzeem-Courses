import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoundEntity } from '../../../../staff-dashboard/rounds/entities/round.entity';
import { RoundStatusEnum } from '../../../../staff-dashboard/rounds/enums/round-status.enum';
import { parseJson } from '../../../../common/helpers/parse-json.helper';

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

  static fromEntity(entity: RoundEntity, lang: string = 'en'): RoundResponse {
    const response = new RoundResponse();
    response.id = entity.id;
    response.courseId = entity.courseId;
    
    if (entity.course) {
      const nameObj = parseJson<Record<string, string>>(entity.course.name);
      response.courseName = nameObj[lang] ?? nameObj['en'] ?? entity.course.name;
    }
    
    response.roundNumber = entity.roundNumber;
    response.startDate = entity.startDate;
    response.endDate = entity.endDate;
    response.status = entity.status;
    response.notes = entity.notes;
    response.showRound = entity.showRound;
    response.sessionsCount = entity.sessions?.length ?? 0;
    response.createdAt = entity.audit?.createdAt;
    response.updatedAt = entity.audit?.updatedAt;
    
    return response;
  }
}
