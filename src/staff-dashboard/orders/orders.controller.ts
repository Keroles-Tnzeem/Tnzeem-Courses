import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Express } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../shared/auth/services/jwt.service';
import { StorageService } from '../../shared/storage/storage.service';
import { UploadType } from '../../shared/storage/enums/upload-type.enum';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';
import { OrdersService } from './orders.service';
import { CreateOrderRequest } from './dto/requests/create-order.request';
import { UpdateOrderRequest } from './dto/requests/update-order.request';
import { QueryOrderRequest } from './dto/requests/query-order.request';
import { OrderResponse } from './dto/responses/order.response';

@ApiTags('Staff Dashboard — Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('staff-dashboard/orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly storageService: StorageService,
    ) {}

    // ── Create ────────────────────────────────────────────────────────────────

    @Post()
    @ApiOperation({ summary: 'Create a new order (staff)' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, type: OrderResponse })
    @UseInterceptors(FileInterceptor('transferBankImg'))
    async create(
        @Body() dto: CreateOrderRequest,
        @CurrentUser('sub') staffId: number,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<ApiResponseDto<OrderResponse>> {
        let transferBankImgUrl: string | undefined;

        if (file) {
            const uploaded = await this.storageService.upload(file, UploadType.IMAGE);
            transferBankImgUrl = uploaded.url;
        }

        const order = await this.ordersService.create(dto, staffId, transferBankImgUrl);
        return ApiResponseDto.success(order);
    }

    // ── Find All ──────────────────────────────────────────────────────────────

    @Get()
    @ApiOperation({ summary: 'List all orders (paginated, filtered, sortable)' })
    @ApiResponse({ status: 200, type: OrderResponse, isArray: true })
    async findAll(
        @Query() query: QueryOrderRequest,
    ): Promise<PaginationResponse<OrderResponse>> {
        return await this.ordersService.findAll(query);
    }

    // ── Find One ──────────────────────────────────────────────────────────────

    @Get(':id')
    @ApiOperation({ summary: 'Get a single order by ULID' })
    @ApiParam({ name: 'id', type: String, description: 'Order ULID' })
    @ApiResponse({ status: 200, type: OrderResponse })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async findOne(
        @Param('id') id: string,
    ): Promise<ApiResponseDto<OrderResponse>> {
        const order = await this.ordersService.findOne(id);
        return ApiResponseDto.success(order);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Patch(':id')
    @ApiOperation({ summary: 'Update an order (status, payment info, etc.)' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'id', type: String, description: 'Order ULID' })
    @ApiResponse({ status: 200, type: OrderResponse })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @UseInterceptors(FileInterceptor('transferBankImg'))
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateOrderRequest,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<ApiResponseDto<OrderResponse>> {
        let transferBankImgUrl: string | undefined;

        if (file) {
            const uploaded = await this.storageService.upload(file, UploadType.IMAGE);
            transferBankImgUrl = uploaded.url;
        }

        const order = await this.ordersService.update(id, dto, transferBankImgUrl);
        return ApiResponseDto.success(order);
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel an order (sets status to CANCELLED)' })
    @ApiParam({ name: 'id', type: String, description: 'Order ULID' })
    @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async cancel(
        @Param('id') id: string,
    ): Promise<ApiResponseDto<null>> {
        await this.ordersService.cancel(id);
        return ApiResponseDto.success(null, 'Order cancelled successfully');
    }
}
