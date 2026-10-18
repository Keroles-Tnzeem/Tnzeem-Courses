import { Controller, Get, HttpCode, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { StudentGuard } from '../../../common/guards/student.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Lang } from '../../../common/decorators/lang.decorator';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { UnreadCountResponse } from '../../../shared/notifications/dto/responses/unread-count.response';
import { NotificationResponse } from '../../../shared/notifications/dto/responses/notification.response';

@ApiTags('Website - Student Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentGuard)
@Controller('website/student/notifications')
export class StudentNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('latest')
  @ApiOperation({ summary: 'Get the last 10 in-app notifications of the authenticated student' })
  @ApiResponse({ status: 200, type: NotificationResponse, isArray: true })
  async latest(
    @CurrentUser('sub') studentId: number,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<NotificationResponse[]>> {
    const data = await this.notificationsService.findLatest(studentId, lang, 10);
    return ApiResponseDto.success(data);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all in-app notifications of the authenticated student (not paginated)' })
  @ApiResponse({ status: 200, type: NotificationResponse, isArray: true })
  async all(
    @CurrentUser('sub') studentId: number,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<NotificationResponse[]>> {
    const data = await this.notificationsService.findLatest(studentId, lang);
    return ApiResponseDto.success(data);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get the count of unread in-app notifications of the authenticated student' })
  @ApiResponse({ status: 200, type: UnreadCountResponse })
  async unreadCount(
    @CurrentUser('sub') studentId: number,
  ): Promise<ApiResponseDto<UnreadCountResponse>> {
    const count = await this.notificationsService.unreadCount(studentId);
    return ApiResponseDto.success({ count });
  }

  @Post(':id/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark one notification of the authenticated student as read' })
  @ApiParam({ name: 'id', type: Number, description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Marked as read (readAt = now)' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @CurrentUser('sub') studentId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<null>> {
    await this.notificationsService.markAsRead(studentId, id);
    return ApiResponseDto.success(null);
  }
}
