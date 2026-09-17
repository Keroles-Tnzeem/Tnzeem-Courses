import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { StudentGuard } from '../../../common/guards/student.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Lang } from '../../../common/decorators/lang.decorator';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { PaginationResponseDto as PaginationResponse } from '../../../common/dto/responses/pagination.response';
import { StudentOrdersService } from './orders.service';
import { QueryStudentOrderRequest } from './dto/requests/query-student-order.request';
import { StudentOrderResponse } from './dto/responses/student-order.response';
import { StudentOrderDetailsResponse } from './dto/responses/student-order-details.response';

@ApiTags('Website - Student Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentGuard)
@Controller('website/student/orders')
export class StudentOrdersController {
  constructor(private readonly ordersService: StudentOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List the authenticated student orders' })
  @ApiResponse({ status: 200, type: StudentOrderResponse, isArray: true })
  async findAll(
    @CurrentUser('sub') studentId: number,
    @Query() query: QueryStudentOrderRequest,
    @Lang() lang: string,
  ): Promise<PaginationResponse<StudentOrderResponse>> {
    return this.ordersService.findAll(studentId, query, lang);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order of the authenticated student' })
  @ApiParam({ name: 'id', type: String, description: 'Order ULID' })
  @ApiResponse({ status: 200, type: StudentOrderDetailsResponse })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @CurrentUser('sub') studentId: number,
    @Param('id') id: string,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<StudentOrderDetailsResponse>> {
    const order = await this.ordersService.findOne(studentId, id, lang);
    return ApiResponseDto.success(order);
  }
}
