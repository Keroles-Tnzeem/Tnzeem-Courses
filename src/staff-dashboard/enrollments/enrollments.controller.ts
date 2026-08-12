import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
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
    ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { EnrollmentsService } from '../../shared/enrollments/enrollments.service';
import { CreateEnrollmentRequest } from '../../shared/enrollments/dto/requests/create-enrollment.request';
import { UpdateEnrollmentRequest } from '../../shared/enrollments/dto/requests/update-enrollment.request';
import { QueryEnrollmentRequest } from '../../shared/enrollments/dto/requests/query-enrollment.request';
import { EnrollmentResponse } from '../../shared/enrollments/dto/responses/enrollment.response';
import { FileFieldsInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Staff Dashboard - Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/enrollments')
export class EnrollmentsController {
    constructor(
        private readonly enrollmentsService: EnrollmentsService,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    // Create 
    @Permissions('enrollments.create')
    @Post()
    @ApiOperation({ summary: 'Create a new manual enrollment' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 201, type: EnrollmentResponse, description: 'Created Enrollment' })
    @UseInterceptors(NoFilesInterceptor())
    async create(@Body() dto: CreateEnrollmentRequest): Promise<ApiResponseDto<EnrollmentResponse>> {
        const data = await this.enrollmentsService.create(dto);
        return ApiResponseDto.success(
            EnrollmentResponse.from(data),
            this.i18n.t('common.created', { lang: this.lang() }),
        );
    }

    // Find All 
    @Permissions('enrollments.view')
    @Get()
    @ApiOperation({ summary: 'List all enrollments (paginated, filtered by student, round, status)' })
    @ApiResponse({ status: 200, type: EnrollmentResponse, isArray: true })
    async findAll(
        @Query() query: QueryEnrollmentRequest,
    ): Promise<PaginationResponseDto<EnrollmentResponse>> {
        const { data, total } = await this.enrollmentsService.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return PaginationResponseDto.success(
            data.map(EnrollmentResponse.from),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // Find One 
    @Permissions('enrollments.view')
    @Get(':id')
    @ApiOperation({ summary: 'Get a single enrollment by ID (ULID)' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({ status: 200, type: EnrollmentResponse })
    async findOne(@Param('id') id: string): Promise<ApiResponseDto<EnrollmentResponse>> {
        const data = await this.enrollmentsService.findOne(id);
        return ApiResponseDto.success(
            EnrollmentResponse.from(data),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // Update 
    @Permissions('enrollments.update')
    @Patch(':id')
    @ApiOperation({ summary: 'Update enrollment status or certificate' })
    @ApiConsumes('multipart/form-data')
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({ status: 200, type: EnrollmentResponse })
    @UseInterceptors(NoFilesInterceptor())
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateEnrollmentRequest,
    ): Promise<ApiResponseDto<EnrollmentResponse>> {
        const data = await this.enrollmentsService.update(id, dto);
        return ApiResponseDto.success(
            EnrollmentResponse.from(data),
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }

    // Delete
    @Permissions('enrollments.delete')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an enrollment manually' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
    async remove(@Param('id') id: string): Promise<ApiResponseDto<null>> {
        await this.enrollmentsService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }

    // Verify Certificate
    @Permissions('enrollments.view')
    @Get('verify-certificate/:serialNum')
    @ApiOperation({ summary: 'Verify a certificate by its serial number' })
    @ApiParam({ name: 'serialNum', type: String })
    @ApiResponse({ status: 200, description: 'Certificate verified successfully' })
    async verifyCertificate(@Param('serialNum') serialNum: string): Promise<ApiResponseDto<any>> {
        const data = await this.enrollmentsService.verifyCertificate(serialNum);
        return ApiResponseDto.success(
            data,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }
}
