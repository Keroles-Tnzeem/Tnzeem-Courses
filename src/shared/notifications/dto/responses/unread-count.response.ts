import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponse {
    @ApiProperty() count: number;
}
