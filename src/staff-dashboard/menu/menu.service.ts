import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { RoundEntity } from '../rounds/entities/round.entity';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';
import { getLang } from 'src/shared/helpers/lang.helper';
import {parseJson} from "../../shared/helpers/parse-json.helper";
import {RoundMenuResponse} from "./dto/responses/round-menu.response";
import {StudentMenuResponse} from "./dto/responses/student-menu.response";

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoundEntity)
    private readonly roundRepository: Repository<RoundEntity>
  ) {}

  async getStudentsMenu(): Promise<StudentMenuResponse[]> {
    const students = await this.userRepository.find({
      where: { userType: UserTypeEnum.STUDENT },
      select: ['id', 'firstName', 'lastName'],
    });

    return students.map((student) => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`.trim(),
    }));
  }

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
        name: `Round ${round.roundNumber}`,
        courseName: nameObj[lang] ?? nameObj['en'] ?? round.course?.name ?? null,
        courseId: round.courseId,
      };
    });
    
  }
}
