import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderCommentRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    comment: string;
}
