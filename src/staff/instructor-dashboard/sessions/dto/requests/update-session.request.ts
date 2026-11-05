import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MeetingStatusEnum } from '../../../../../shared/meetings/enums/meeting-status.enum';
import { CreateSessionRequest } from './create-session.request';

export class UpdateSessionRequest extends PartialType(
  OmitType(CreateSessionRequest, ['roundId'] as const),
) {
  @ApiPropertyOptional({
    enum: MeetingStatusEnum,
    description: 'Update session meeting status (e.g. cancelled, completed)',
  })
  @IsEnum(MeetingStatusEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  @IsOptional()
  meetingStatus?: MeetingStatusEnum;
}
