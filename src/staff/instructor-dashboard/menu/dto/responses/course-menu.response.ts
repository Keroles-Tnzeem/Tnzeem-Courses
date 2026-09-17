import { ApiProperty } from '@nestjs/swagger';

export class CourseMenuResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
