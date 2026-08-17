import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderCommentRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    comment: string;
}
