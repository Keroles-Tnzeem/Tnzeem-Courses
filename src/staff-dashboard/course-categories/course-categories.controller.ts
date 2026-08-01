import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CourseCategoriesService } from './course-categories.service';
import { CreateCourseCategoryRequest } from './dto/requests/create-course-category.request';
import { UpdateCourseCategoryRequest } from './dto/requests/update-course-category.request';
import { QueryCourseCategoryRequest } from './dto/requests/query-course-category.request';
import { CourseCategoryResponse } from './dto/responses/course-category.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';

@ApiTags('Staff Dashboard - Course Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/course-categories')
export class CourseCategoriesController {
    constructor(
        private readonly courseCategoriesService: CourseCategoriesService,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    @Permissions('course-categories.create')
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({ summary: 'Create course category' })
    @ApiCreatedResponse({ description: 'Course category created successfully', type: CourseCategoryResponse })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'JSON string: {ar, en}' },
                description: { type: 'string', description: 'JSON string: {ar, en}' },
                image: { type: 'string', format: 'binary', nullable: true },
            },
            required: ['name', 'description'],
        },
    })
    async create(
        @Body() dto: CreateCourseCategoryRequest,
        @UploadedFile(new ParseFilePipe({ fileIsRequired: false })) image?: any,
    ) {
        const data = await this.courseCategoriesService.create(dto, image);
        return ApiResponseDto.success(
            CourseCategoryResponse.from(data, this.lang()),
            this.i18n.t('common.created', { lang: this.lang() }),
        );
    }

    @Permissions('course-categories.view')
    @Get()
    @ApiOperation({ summary: 'List course categories with pagination and search' })
    @ApiOkResponse({ description: 'Course categories returned successfully', type: CourseCategoryResponse, isArray: true })
    async findAll(@Query() query: QueryCourseCategoryRequest) {
        const { data, total } = await this.courseCategoriesService.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;
        
        return PaginationResponseDto.success(
            data.map(c => CourseCategoryResponse.from(c, this.lang())),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    @Permissions('course-categories.view')
    @Get(':id')
    @ApiOperation({ summary: 'Get course category by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Course category returned successfully', type: CourseCategoryResponse })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.courseCategoriesService.findOne(id);
        return ApiResponseDto.success(
            CourseCategoryResponse.from(data, this.lang()),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    @Permissions('course-categories.update')
    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    @ApiOperation({ summary: 'Update course category' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Course category updated successfully', type: CourseCategoryResponse })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'JSON string: {ar, en}' },
                description: { type: 'string', description: 'JSON string: {ar, en}' },
                image: { type: 'string', format: 'binary', nullable: true },
            },
        },
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCourseCategoryRequest,
        @UploadedFile(new ParseFilePipe({ fileIsRequired: false })) image?: any,
    ) {
        const data = await this.courseCategoriesService.update(id, dto, image);
        return ApiResponseDto.success(
            CourseCategoryResponse.from(data, this.lang()),
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }

    @Permissions('course-categories.delete')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete course category' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Course category deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.courseCategoriesService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
