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
    UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RoundsService } from './rounds.service';
import { CreateRoundRequest } from './dto/requests/create-round.request';
import { UpdateRoundRequest } from './dto/requests/update-round.request';
import { QueryRoundRequest } from './dto/requests/query-round.request';
import { RoundResponse } from './dto/responses/round.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';

@ApiTags('Staff Dashboard - Rounds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/rounds')
export class RoundsController {
    constructor(
        private readonly roundsService: RoundsService,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    @Permissions('rounds.create')
    @Post()
    @UseInterceptors(NoFilesInterceptor())
    @ApiOperation({ summary: 'Create a new round for a course' })
    @ApiCreatedResponse({ description: 'Round created successfully', type: RoundResponse })
    async create(@Body() dto: CreateRoundRequest) {
        const data = await this.roundsService.create(dto);
        return ApiResponseDto.success(
            RoundResponse.from(data, this.lang()),
            this.i18n.t('common.created', { lang: this.lang() }),
        );
    }

    @Permissions('rounds.view')
    @Get()
    @ApiOperation({ summary: 'List rounds with pagination, filters (courseId, status), and sorting' })
    @ApiOkResponse({ description: 'Rounds returned successfully', type: RoundResponse, isArray: true })
    async findAll(@Query() query: QueryRoundRequest) {
        const { data, total } = await this.roundsService.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return PaginationResponseDto.success(
            data.map(round => RoundResponse.from(round, this.lang())),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    @Permissions('rounds.view')
    @Get('by-course/:courseId')
    @ApiOperation({ summary: 'Get all rounds for a specific course' })
    @ApiParam({ name: 'courseId', type: Number })
    @ApiOkResponse({ description: 'Rounds returned successfully', type: RoundResponse, isArray: true })
    async findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
        const data = await this.roundsService.findByCourse(courseId);
        return ApiResponseDto.success(
            data.map(round => RoundResponse.from(round, this.lang())),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    @Permissions('rounds.view')
    @Get(':id')
    @ApiOperation({ summary: 'Get round by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Round returned successfully', type: RoundResponse })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.roundsService.findOne(id);
        return ApiResponseDto.success(
            RoundResponse.from(data, this.lang()),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    @Permissions('rounds.update')
    @Patch(':id')
    @UseInterceptors(NoFilesInterceptor())
    @ApiOperation({ summary: 'Update a round' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Round updated successfully', type: RoundResponse })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoundRequest,
    ) {
        const data = await this.roundsService.update(id, dto);
        return ApiResponseDto.success(
            RoundResponse.from(data, this.lang()),
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }

    @Permissions('rounds.delete')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a round (soft delete)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Round deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.roundsService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
