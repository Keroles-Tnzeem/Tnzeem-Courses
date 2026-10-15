import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Lang } from '../../common/decorators/lang.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { NotificationsService } from './notifications.service';
import { QueryNotificationRequest } from './dto/requests/query-notification.request';
import { NotificationResponse } from './dto/responses/notification.response';

/** In-app inbox of the authenticated user — shared by every dashboard (student, instructor, staff). */
@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my in-app notifications' })
  @ApiResponse({ status: 200, type: NotificationResponse, isArray: true })
  async findAll(
    @CurrentUser('sub') userId: number,
    @Query() query: QueryNotificationRequest,
    @Lang() lang: string,
  ): Promise<PaginationResponseDto<NotificationResponse>> {
    return this.notificationsService.findAll(userId, query, lang);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all my notifications as read' })
  @ApiResponse({ status: 200 })
  async markAllAsRead(
    @CurrentUser('sub') userId: number,
  ): Promise<ApiResponseDto<null>> {
    await this.notificationsService.markAllAsRead(userId);
    return ApiResponseDto.success(null);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one of my notifications as read' })
  @ApiParam({ name: 'id', type: String, description: 'Notification ULID' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @CurrentUser('sub') userId: number,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<null>> {
    await this.notificationsService.markAsRead(userId, id);
    return ApiResponseDto.success(null);
  }
}
