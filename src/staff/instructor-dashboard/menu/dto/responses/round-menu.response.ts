import { ApiProperty } from '@nestjs/swagger';

export class RoundMenuResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  courseName: string | null;

  @ApiProperty()
  courseId: number;
}
