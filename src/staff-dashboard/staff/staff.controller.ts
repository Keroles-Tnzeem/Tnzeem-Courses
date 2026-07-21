import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
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
    async findAll() {
        const data = await this.staffService.findAll();
        return ApiResponseDto.success(
            data.map(StaffResponse.from),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // GET /staff-dashboard/staff/:id
    @Permissions('users.view')
    @Get(':id')
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
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.staffService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
