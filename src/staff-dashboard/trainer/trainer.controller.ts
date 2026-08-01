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
import { TrainerService } from './trainer.service';
import { CreateTrainerRequest } from './dto/requests/create-trainer.request';
import { UpdateTrainerRequest } from './dto/requests/update-trainer.request';
import { TrainerResponse } from './dto/responses/trainer.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { PaginationRequest } from '../../common/dto/requests/pagination.request';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Staff Dashboard - Trainers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/trainer')
export class TrainerController {
    constructor(
        private readonly trainerService: TrainerService,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    // GET /staff-dashboard/trainer
    @Permissions('trainers.view')
    @Get()
    @ApiOperation({ summary: 'List trainers with pagination and search' })
    @ApiOkResponse({ description: 'Trainers returned successfully', type: TrainerResponse, isArray: true })
    async findAll(@Query() query: PaginationRequest) {
        const { data, total } = await this.trainerService.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return PaginationResponseDto.success(
            data.map(TrainerResponse.from),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // GET /staff-dashboard/trainer/:id
    @Permissions('trainers.view')
    @Get(':id')
    @ApiOperation({ summary: 'Get a trainer by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Trainer returned successfully', type: TrainerResponse })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.trainerService.findOne(id);
        return ApiResponseDto.success(
            TrainerResponse.from(data),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // POST /staff-dashboard/trainer
    @Permissions('trainers.create')
    @Post()
    @ApiOperation({ summary: 'Create a trainer' })
    @ApiCreatedResponse({ description: 'Trainer created successfully', type: TrainerResponse })
    async create(@Body() dto: CreateTrainerRequest) {
        const data = await this.trainerService.create(dto);
        return ApiResponseDto.success(
            TrainerResponse.from(data),
            this.i18n.t('common.created', { lang: this.lang() }),
        );
    }

    // PATCH /staff-dashboard/trainer/:id
    @Permissions('trainers.update')
    @Patch(':id')
    @ApiOperation({ summary: 'Update a trainer' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Trainer updated successfully', type: TrainerResponse })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateTrainerRequest,
    ) {
        const data = await this.trainerService.update(id, dto);
        return ApiResponseDto.success(
            TrainerResponse.from(data),
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }

    // DELETE /staff-dashboard/trainer/:id
    @Permissions('trainers.delete')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a trainer' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Trainer deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.trainerService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
