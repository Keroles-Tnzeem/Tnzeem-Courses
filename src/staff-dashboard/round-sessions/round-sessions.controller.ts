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
import { RoundSessionsService } from './round-sessions.service';
import { CreateRoundSessionRequest } from './dto/requests/create-round-session.request';
import { UpdateRoundSessionRequest } from './dto/requests/update-round-session.request';
import { QueryRoundSessionRequest } from './dto/requests/query-round-session.request';
import { RoundSessionResponse } from './dto/responses/round-session.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';

@ApiTags('Staff Dashboard - Round Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/round-sessions')
export class RoundSessionsController {
    constructor(
        private readonly roundSessionsService: RoundSessionsService,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    @Permissions('round-sessions.create')
    @Post()
    @UseInterceptors(NoFilesInterceptor())
    @ApiOperation({ summary: 'Create a new session for a round' })
    @ApiCreatedResponse({ description: 'Session created successfully', type: RoundSessionResponse })
    async create(@Body() dto: CreateRoundSessionRequest) {
        const data = await this.roundSessionsService.create(dto);
        return ApiResponseDto.success(
            RoundSessionResponse.from(data),
            this.i18n.t('common.created', { lang: this.lang() }),
        );
    }

    @Permissions('round-sessions.view')
    @Get()
    @ApiOperation({ summary: 'List sessions with pagination, roundId filter, and sorting' })
    @ApiOkResponse({ description: 'Sessions returned successfully', type: RoundSessionResponse, isArray: true })
    async findAll(@Query() query: QueryRoundSessionRequest) {
        const { data, total } = await this.roundSessionsService.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return PaginationResponseDto.success(
            data.map(RoundSessionResponse.from),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    @Permissions('round-sessions.view')
    @Get('by-round/:roundId')
    @ApiOperation({ summary: 'Get all sessions for a specific round' })
    @ApiParam({ name: 'roundId', type: Number })
    @ApiOkResponse({ description: 'Sessions returned successfully', type: RoundSessionResponse, isArray: true })
    async findByRound(@Param('roundId', ParseIntPipe) roundId: number) {
        const data = await this.roundSessionsService.findByRound(roundId);
        return ApiResponseDto.success(
            data.map(RoundSessionResponse.from),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    @Permissions('round-sessions.view')
    @Get(':id')
    @ApiOperation({ summary: 'Get a session by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Session returned successfully', type: RoundSessionResponse })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.roundSessionsService.findOne(id);
        return ApiResponseDto.success(
            RoundSessionResponse.from(data),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    @Permissions('round-sessions.update')
    @Patch(':id')
    @UseInterceptors(NoFilesInterceptor())
    @ApiOperation({ summary: 'Update a session' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Session updated successfully', type: RoundSessionResponse })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateRoundSessionRequest,
    ) {
        const data = await this.roundSessionsService.update(id, dto);
        return ApiResponseDto.success(
            RoundSessionResponse.from(data),
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }

    @Permissions('round-sessions.delete')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a session (soft delete)' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Session deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.roundSessionsService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
