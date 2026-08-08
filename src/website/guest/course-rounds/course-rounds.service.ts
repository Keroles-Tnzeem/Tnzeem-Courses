import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoundEntity } from '../../../staff-dashboard/rounds/entities/round.entity';
import {QueryCourseRoundsRequest} from "./dto/reauests/query-course-rounds.request";

@Injectable()
export class GuestCourseRoundsService {
    constructor(
        @InjectRepository(RoundEntity)
        private readonly roundRepository: Repository<RoundEntity>,
    ) {}

    async findAll(
        query: QueryCourseRoundsRequest,
    ): Promise<RoundEntity[]> {
        const { categoryId } = query;

        const qb = this.roundRepository
            .createQueryBuilder('round')
            .leftJoinAndSelect('round.course', 'course')
            .leftJoinAndSelect('course.trainer', 'trainer');

        if (categoryId) {
            qb.andWhere('course.category_id = :categoryId', {
                categoryId,
            });
        }

        qb.orderBy('round.startDate', 'DESC');

        return qb.getMany();
    }

    async findOneBySlugAndRoundNumber(courseSlug: string, id: number): Promise<RoundEntity | null> {
        return await this.roundRepository.findOne({
            where: {
                id,
                course: { slug: courseSlug }
            },
            relations: ['course', 'course.trainer', 'sessions'],
        });
    }
}
