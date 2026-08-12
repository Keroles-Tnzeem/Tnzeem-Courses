import { ApiProperty } from '@nestjs/swagger';

export class RoundMenuResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    roundNumber: number;

    @ApiProperty()
    startDate: Date;

    @ApiProperty({ nullable: true })
    courseName: string | null;

    @ApiProperty()
    courseId: number;


}