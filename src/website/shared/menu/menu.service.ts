import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getLang } from 'src/common/helpers/lang.helper';
import {RoundMenuResponse} from "./dto/responses/round-menu.response";
import {RoundEntity} from "../../../staff-dashboard/rounds/entities/round.entity";
import {CourseEntity} from "../../../staff-dashboard/courses/entities/course.entity";
import {CourseMenuResponse} from "./dto/responses/course-menu.response";
import {parseJson} from "../../../common/helpers/parse-json.helper";

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(RoundEntity)
    private readonly roundRepository: Repository<RoundEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>
  ) {}


  async getRoundsMenu(): Promise<RoundMenuResponse[]> {
    const rounds = await this.roundRepository.find({
      relations: ['course'],
      select: ['id', 'roundNumber', 'courseId', 'course', 'startDate', 'endDate'],
    });

    const lang = getLang();

    return rounds.map((round) => {
      const nameObj = parseJson<Record<string, string>>(round.course?.name);
      return {
        id: round.id,
        roundNumber: round.roundNumber,
        startDate: round.startDate,
        courseName: nameObj[lang] ?? nameObj['en'] ?? round.course?.name ?? null,
        courseId: round.courseId,
      };
    });
    
    
  }

  async getCoursesMenu(): Promise<CourseMenuResponse[]> {
    const courses = await this.courseRepository.find({
      select: ['id', 'name'],
    });

    const lang = getLang();

    return courses.map((course) => {
      const nameObj = parseJson<Record<string, string>>(course.name);
      return {
        id: course.id,
        name: nameObj[lang] ?? nameObj['en'] ?? course.name ?? null,
      };
    });
  }
}
