import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get the last 10 in-app notifications of the authenticated student and mark them as read' })
  @ApiResponse({ status: 200, type: NotificationResponse, isArray: true })
  async latest(
    @CurrentUser('sub') studentId: number,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<NotificationResponse[]>> {
    const data = await this.notificationsService.findLatest(studentId, lang, 10, true);
    return ApiResponseDto.success(data);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all in-app notifications of the authenticated student (not paginated) and mark them as read' })
  @ApiResponse({ status: 200, type: NotificationResponse, isArray: true })
  async all(
    @CurrentUser('sub') studentId: number,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<NotificationResponse[]>> {
    const data = await this.notificationsService.findLatest(studentId, lang, undefined, true);
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
}
