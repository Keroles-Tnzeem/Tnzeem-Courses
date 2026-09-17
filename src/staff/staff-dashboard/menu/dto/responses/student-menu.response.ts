import { ApiProperty } from '@nestjs/swagger';

export class StudentMenuResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}