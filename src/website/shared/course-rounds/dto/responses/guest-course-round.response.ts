import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoundEntity } from '../../../../../staff-dashboard/rounds/entities/round.entity';
import { RoundStatusEnum } from '../../../../../staff-dashboard/rounds/enums/round-status.enum';

export class GuestCourseRoundResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  courseId: number;

  @ApiPropertyOptional()
  course?: any;

  @ApiProperty()
  roundNumber: number;

  @ApiPropertyOptional()
  startDate: Date;

  @ApiPropertyOptional()
  endDate: Date;

  @ApiProperty({ enum: RoundStatusEnum })
  status: RoundStatusEnum;

  @ApiPropertyOptional()
  sessions?: any[];

  static from(
    entity: RoundEntity,
    lang: string = 'en',
    i18n?: any,
  ): GuestCourseRoundResponse {
    const response = new GuestCourseRoundResponse();
    response.id = entity.id;
    response.courseId = entity.courseId;

    if (entity.course) {
      const parseJson = (val: any) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return {};
          }
        }
        return val || {};
      };

      const nameObj = parseJson(entity.course.name);
      const descObj = parseJson(entity.course.description);
      const reqObj = parseJson(entity.course.requirements);
      const benObj = parseJson(entity.course.benefits);

      response.course = {
        id: entity.course.id,
        category_id: entity.course.categoryId,
        name: nameObj[lang] ?? nameObj['en'] ?? entity.course.name,
        description:
          descObj[lang] ?? descObj['en'] ?? entity.course.description,
        requirements: reqObj[lang] ?? reqObj['en'] ?? '',
        benefits: benObj[lang] ?? benObj['en'] ?? '',
        slug: entity.course.slug,
        image: entity.course.image,
        introVideo: entity.course.introVideo,
        sessionsCount: entity.course.sessionsCount,
        durationHours: entity.course.durationHours,
        price: Number(entity.course.price),
        level: entity.course.level,
      };

      if (entity.course.trainer) {
        response.course.trainer = {
          id: entity.course.trainer.id,
          firstName: entity.course.trainer.firstName,
          lastName: entity.course.trainer.lastName,
          image: entity.course.trainer.img,
        };
      }
    }

    response.roundNumber = entity.roundNumber;
    response.startDate = entity.startDate;
    response.endDate = entity.endDate;
    response.status = entity.status;

    return response;
  }
}
