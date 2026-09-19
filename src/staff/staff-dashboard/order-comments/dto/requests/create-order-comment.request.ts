import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderCommentRequest {
    @ApiProperty()
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    orderId: string;

    @ApiProperty()
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    comment: string;
}
