import { ApiProperty } from '@nestjs/swagger';

export class StaffMenuResponse {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;
}
