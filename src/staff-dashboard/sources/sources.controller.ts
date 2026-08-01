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
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { SourcesService } from './sources.service';
import { CreateSourceRequest } from './dto/requests/create-source.request';
import { UpdateSourceRequest } from './dto/requests/update-source.request';
import { QuerySourceRequest } from './dto/requests/query-source.request';
import { SourceResponse } from './dto/responses/source.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';

@ApiTags('Staff Dashboard - Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/sources')
export class SourcesController {
  constructor(
    private readonly sourcesService: SourcesService,
    private readonly i18n: I18nService,
  ) {}

  private lang(): string {
    return I18nContext.current()?.lang ?? 'en';
  }

  @Permissions('sources.create')
  @Post()
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({ summary: 'Create a source' })
  @ApiCreatedResponse({ description: 'Source created successfully', type: SourceResponse })
  async create(@Body() dto: CreateSourceRequest) {
    const data = await this.sourcesService.create(dto);
    return ApiResponseDto.success(
      SourceResponse.from(data),
      this.i18n.t('common.created', { lang: this.lang() }),
    );
  }

  @Permissions('sources.view')
  @Get()
  @ApiOperation({
    summary: 'List sources with pagination, search, and sorting',
  })
  @ApiOkResponse({ description: 'Sources returned successfully', type: SourceResponse, isArray: true })
  async findAll(@Query() query: QuerySourceRequest) {
    const { data, total } = await this.sourcesService.findAll(query);
    const limit = query.limit || 10;
    const page = query.page || 1;

    return PaginationResponseDto.success(
      data.map(SourceResponse.from),
      total,
      page,
      limit,
      this.i18n.t('common.success', { lang: this.lang() }),
    );
  }

  @Permissions('sources.view')
  @Get(':id')
  @ApiOperation({ summary: 'Get source by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Source returned successfully', type: SourceResponse })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.sourcesService.findOne(id);
    return ApiResponseDto.success(
      SourceResponse.from(data),
      this.i18n.t('common.success', { lang: this.lang() }),
    );
  }

  @Permissions('sources.update')
  @Patch(':id')
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({ summary: 'Update a source' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Source updated successfully', type: SourceResponse })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSourceRequest,
  ) {
    const data = await this.sourcesService.update(id, dto);
    return ApiResponseDto.success(
      SourceResponse.from(data),
      this.i18n.t('common.updated', { lang: this.lang() }),
    );
  }

  @Permissions('sources.delete')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a source' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Source deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.sourcesService.remove(id);
    return ApiResponseDto.success(
      null,
      this.i18n.t('common.deleted', { lang: this.lang() }),
    );
  }
}
