import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { StaffService } from './staff.service';
import { CreateStaffRequest } from './dto/requests/create-staff.request';
import { UpdateStaffRequest } from './dto/requests/update-staff.request';
import { StaffResponse } from './dto/responses/staff.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { PaginationRequest } from '../../common/dto/requests/pagination.request';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Staff Dashboard - Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/staff')
export class StaffController {
    constructor(
        private readonly staffService: StaffService,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    // GET /staff-dashboard/staff
    @Permissions('users.view')
    @Get()
    @ApiOperation({ summary: 'List staff with pagination and search' })
    @ApiOkResponse({ description: 'Staff returned successfully', type: StaffResponse, isArray: true })
    async findAll(@Query() query: PaginationRequest) {
        const { data, total } = await this.staffService.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return PaginationResponseDto.success(
            data.map(StaffResponse.from),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // GET /staff-dashboard/staff/:id
    @Permissions('users.view')
    @Get(':id')
    @ApiOperation({ summary: 'Get a staff member by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Staff member returned successfully', type: StaffResponse })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.staffService.findOne(id);
        return ApiResponseDto.success(
            StaffResponse.from(data),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // POST /staff-dashboard/staff
    @Permissions('users.create')
    @Post()
    @ApiOperation({ summary: 'Create a staff member' })
    @ApiCreatedResponse({ description: 'Staff member created successfully', type: StaffResponse })
    async create(@Body() dto: CreateStaffRequest) {
        const data = await this.staffService.create(dto);
        return ApiResponseDto.success(
            StaffResponse.from(data),
            this.i18n.t('common.created', { lang: this.lang() }),
        );
    }

    // PATCH /staff-dashboard/staff/:id
    @Permissions('users.update')
    @Patch(':id')
    @ApiOperation({ summary: 'Update a staff member' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Staff member updated successfully', type: StaffResponse })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStaffRequest,
    ) {
        const data = await this.staffService.update(id, dto);
        return ApiResponseDto.success(
            StaffResponse.from(data),
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }

    // DELETE /staff-dashboard/staff/:id
    @Permissions('users.delete')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a staff member' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Staff member deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.staffService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
