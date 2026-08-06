import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoundEntity } from '../../../staff-dashboard/rounds/entities/round.entity';

@Injectable()
export class GuestCourseRoundsService {
    constructor(
        @InjectRepository(RoundEntity)
        private readonly roundRepository: Repository<RoundEntity>,
    ) {}

    async findAll(): Promise<RoundEntity[]> {
        return await this.roundRepository.find({
            relations: ['course', 'course.trainer'],
            order: { startDate: 'DESC' },
        });
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
