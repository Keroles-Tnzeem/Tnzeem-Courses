import { ApiProperty } from '@nestjs/swagger';

export class TrainerMenuResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}
