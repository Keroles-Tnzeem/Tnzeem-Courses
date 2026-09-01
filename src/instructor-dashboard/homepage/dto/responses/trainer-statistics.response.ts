import { ApiProperty } from '@nestjs/swagger';

export class TrainerStatisticsResponse {
  @ApiProperty({ description: 'Number of courses created by the trainer' })
  coursesCount: number;

  @ApiProperty({ description: 'Number of rounds for the trainer courses' })
  roundsCount: number;

  @ApiProperty({ description: 'Number of orders for the trainer courses' })
  ordersCount: number;

  @ApiProperty({ description: 'Number of sessions the trainer has' })
  sessionsCount: number;
}
