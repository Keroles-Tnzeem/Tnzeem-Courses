import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
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
import { CreateStudentOrderRequest } from './dto/requests/create-student-order.request';
import { StudentOrderResponse } from './dto/responses/student-order.response';
import { StudentOrderDetailsResponse } from './dto/responses/student-order-details.response';
import {NoFilesInterceptor} from "@nestjs/platform-express";

@ApiTags('Website - Student Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentGuard)
@Controller('website/student/orders')
export class StudentOrdersController {
  constructor(private readonly ordersService: StudentOrdersService) {}

  @Post()
  @UseInterceptors(NoFilesInterceptor())
  @ApiHeader({
    name: 'Idempotency-Key',
    required: true,
    description:
      'Client-generated UUID; retrying the same request with the same key replays the first result instead of creating a duplicate order.',
  })
  @ApiOperation({ summary: 'Create a new order for the authenticated student' })
  @ApiResponse({ status: 201, type: StudentOrderDetailsResponse })
  @ApiResponse({ status: 400, description: 'Idempotency-Key header missing' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({
    status: 409,
    description:
      'Student already has a pending unpaid order for this course, or this idempotency key was already used (in progress or already processed)',
  })
  async create(
    @CurrentUser('sub') studentId: number,
    @Body() dto: CreateStudentOrderRequest,
    @Lang() lang: string,
    @Headers('idempotency-key') idempotencyKey: string,
  ): Promise<ApiResponseDto<StudentOrderDetailsResponse>> {
    const order = await this.ordersService.create(
      studentId,
      dto,
      lang,
      idempotencyKey,
    );
    return ApiResponseDto.success(order);
  }

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
