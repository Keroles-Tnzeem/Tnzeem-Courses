import { ApiProperty } from '@nestjs/swagger';

export class CourseCategoryMenuResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
