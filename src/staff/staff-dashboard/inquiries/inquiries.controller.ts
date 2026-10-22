import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { PaginationResponseDto } from '../../../common/dto/responses/pagination.response';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { StaffInquiriesService } from './inquiries.service';
import { QueryInquiryRequest } from './dto/requests/query-inquiry.request';
import { UpdateInquiryStatusRequest } from './dto/requests/update-inquiry-status.request';
import { StaffInquiryResponse } from './dto/responses/staff-inquiry.response';
import { NoFilesInterceptor } from '@nestjs/platform-express';
@ApiTags('Staff Dashboard — Inquiries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/inquiries')
export class StaffInquiriesController {
  constructor(private readonly inquiriesService: StaffInquiriesService) {}

  //@Permissions('inquiries.view')
  @Get()
  @ApiOperation({ summary: 'List all inquiries (paginated, filterable)' })
  @ApiResponse({ status: 200, type: StaffInquiryResponse, isArray: true })
  async findAll(
    @Query() query: QueryInquiryRequest,
  ): Promise<PaginationResponseDto<StaffInquiryResponse>> {
    return this.inquiriesService.findAll(query);
  }

  //@Permissions('inquiries.view')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single inquiry by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: StaffInquiryResponse })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<StaffInquiryResponse>> {
    const data = await this.inquiriesService.findOne(id);
    return ApiResponseDto.success(data);
  }

  //@Permissions('inquiries.update')
  @Patch(':id/status')
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({
    summary: 'Update the status of an inquiry (pending → complete)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: StaffInquiryResponse })
  @ApiResponse({ status: 404, description: 'Inquiry not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInquiryStatusRequest,
  ): Promise<ApiResponseDto<StaffInquiryResponse>> {
    const data = await this.inquiriesService.updateStatus(id, dto);
    return ApiResponseDto.success(data);
  }
}
