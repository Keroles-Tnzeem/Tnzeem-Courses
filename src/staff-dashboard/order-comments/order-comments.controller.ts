import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { OrderCommentsService } from './order-comments.service';
import { CreateOrderCommentRequest } from './dto/requests/create-order-comment.request';
import { UpdateOrderCommentRequest } from './dto/requests/update-order-comment.request';
import { QueryOrderCommentRequest } from './dto/requests/query-order-comment.request';
import { OrderCommentResponse } from './dto/responses/order-comment.response';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@ApiTags('Order Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/order-comments')
export class OrderCommentsController {
    constructor(
        private readonly orderCommentsService: OrderCommentsService,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    @Post()
    @ApiOperation({ summary: 'Create order comment' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(NoFilesInterceptor())
    @ApiResponse({ status: 201, type: OrderCommentResponse })
    @Permissions('orders.create')
    async create(
        @CurrentUser('sub') staffId: number,
        @Body() dto: CreateOrderCommentRequest,
    ): Promise<ApiResponseDto<OrderCommentResponse>> {
        const comment = await this.orderCommentsService.create(staffId, dto);
        return ApiResponseDto.success(
            comment,
            this.i18n.t('common.created', { lang: this.lang() }),
        );
    }

    @Get()
    @ApiOperation({ summary: 'List order comments' })
    @ApiResponse({ status: 200, type: OrderCommentResponse, isArray: true })
    @Permissions('orders.view')
    async findAll(
        @Query() query: QueryOrderCommentRequest,
    ): Promise<PaginationResponseDto<OrderCommentResponse>> {
        return await this.orderCommentsService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order comment by id' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: OrderCommentResponse })
    @Permissions('orders.view')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDto<OrderCommentResponse>> {
        const comment = await this.orderCommentsService.findOne(id);
        return ApiResponseDto.success(comment);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update order comment' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(NoFilesInterceptor())
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: OrderCommentResponse })
    @Permissions('orders.update')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateOrderCommentRequest,
    ): Promise<ApiResponseDto<OrderCommentResponse>> {
        const comment = await this.orderCommentsService.update(id, dto);
        return ApiResponseDto.success(
            comment,
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete order comment' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200 })
    @Permissions('orders.delete')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponseDto<null>> {
        await this.orderCommentsService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
