import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaginationRequest } from '../../../../common/dto/requests/pagination.request';

export class QueryNotificationRequest extends PaginationRequest {
    @ApiPropertyOptional({ description: 'Return only unread notifications' })
    @Transform(({ value }) => value === true || value === 'true')
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    @IsOptional()
    unreadOnly?: boolean;
}
