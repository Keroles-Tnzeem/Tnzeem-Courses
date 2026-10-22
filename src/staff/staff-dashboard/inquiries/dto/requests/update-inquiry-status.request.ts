import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { InquiryStatusEnum } from '../../../../../shared/inquiries/enums/inquiry-status.enum';

export class UpdateInquiryStatusRequest {
  @ApiProperty({ enum: InquiryStatusEnum, example: InquiryStatusEnum.COMPLETE })
  @IsEnum(InquiryStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  status: InquiryStatusEnum;
}
