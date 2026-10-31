import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { getTranslatedString } from '../../../../common/utils/translation.util';
import { NotificationEntity } from '../../entities/notification.entity';
import { NotificationTypeEnum } from '../../enums/notification-type.enum';

export class NotificationResponse {
  @ApiProperty() id: number;
  @ApiProperty({ enum: NotificationTypeEnum }) type: NotificationTypeEnum;
  @ApiProperty() title: string;
  @ApiProperty() body: string;
  @ApiPropertyOptional({ type: Object }) data?: Record<string, unknown> | null;
  @ApiProperty() isRead: boolean;
  @ApiPropertyOptional() readAt?: Date | null;
  @ApiProperty() createdAt: Date;

  static fromEntity(
    entity: NotificationEntity,
    lang: string,
  ): NotificationResponse {
    const res = new NotificationResponse();
    res.id = entity.id;
    res.type = entity.type;
    res.title = getTranslatedString(entity.title, lang);
    res.body = getTranslatedString(entity.body, lang);
    res.data = entity.data;
    res.isRead = !!entity.readAt;
    res.readAt = entity.readAt;
    res.createdAt = entity.audit.createdAt;
    return res;
  }
}
