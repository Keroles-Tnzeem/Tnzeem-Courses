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
import { I18nContext, I18nService } from 'nestjs-i18n';
import { StudentService } from './student.service';
import { CreateStudentRequest } from './dto/requests/create-student.request';
import { UpdateStudentRequest } from './dto/requests/update-student.request';
import { StudentResponse } from './dto/responses/student.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { PaginationRequest } from '../../common/dto/requests/pagination.request';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AssignStaffToStudentRequest } from './dto/requests/assign-staff.request';
import { FilterStudentRequest } from './dto/requests/filter-student.request';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Staff Dashboard - Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/student')
export class StudentController {
    constructor(
        private readonly studentService: StudentService,
        private readonly i18n: I18nService,
    ) {}

    private lang(): string {
        return I18nContext.current()?.lang ?? 'en';
    }

    // GET /staff-dashboard/student
    @Permissions('students.view')
    @Get()
    @ApiOperation({ summary: 'List students with pagination and search' })
    @ApiOkResponse({ description: 'Students returned successfully', type: StudentResponse, isArray: true })
    async findAll(@Query() query: FilterStudentRequest) {
        const { data, total } = await this.studentService.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return PaginationResponseDto.success(
            data.map(StudentResponse.from),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // GET /staff-dashboard/student/my-students
    @Permissions('students.view')
    @Get('my-students')
    @ApiOperation({ summary: 'Get students assigned to the current staff member' })
    @ApiOkResponse({ description: 'Students returned successfully', type: StudentResponse, isArray: true })
    async findMyStudents(
        @CurrentUser('sub') userId: number,
        @Query() query: FilterStudentRequest,
    ) {
        const { data, total } = await this.studentService.findMyStudents(userId, query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return PaginationResponseDto.success(
            data.map(StudentResponse.from),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // GET /staff-dashboard/student/:id
    @Permissions('students.view')
    @Get(':id')
    @ApiOperation({ summary: 'Get a student by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Student returned successfully', type: StudentResponse })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.studentService.findOne(id);
        return ApiResponseDto.success(
            StudentResponse.from(data),
            this.i18n.t('common.success', { lang: this.lang() }),
        );
    }

    // POST /staff-dashboard/student
    @Permissions('students.create')
    @Post()
    @UseInterceptors(NoFilesInterceptor())
    @ApiOperation({ summary: 'Create a student' })
    @ApiCreatedResponse({ description: 'Student created successfully', type: StudentResponse })
    async create(@Body() dto: CreateStudentRequest) {
        const data = await this.studentService.create(dto);
        return ApiResponseDto.success(
            StudentResponse.from(data),
            this.i18n.t('common.created', { lang: this.lang() }),
        );
    }

    // PATCH /staff-dashboard/student/:id
    @Permissions('students.update')
    @Patch(':id')
    @UseInterceptors(NoFilesInterceptor())
    @ApiOperation({ summary: 'Update a student' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Student updated successfully', type: StudentResponse })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStudentRequest,
    ) {
        const data = await this.studentService.update(id, dto);
        return ApiResponseDto.success(
            StudentResponse.from(data),
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }

    // PATCH /staff-dashboard/student/:id/assign
    @Permissions('students.assign')
    @Patch(':id/assign')
    @UseInterceptors(NoFilesInterceptor())
    @ApiOperation({ summary: 'Assign a staff member (sales/support) to a student' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Staff assigned successfully', type: StudentResponse })
    async assignStaff(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AssignStaffToStudentRequest,
    ) {
        const data = await this.studentService.assignStaff(id, dto);
        return ApiResponseDto.success(
            StudentResponse.from(data),
            this.i18n.t('common.updated', { lang: this.lang() }),
        );
    }


    // DELETE /staff-dashboard/student/:id
    @Permissions('students.delete')
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a student' })
    @ApiParam({ name: 'id', type: Number })
    @ApiOkResponse({ description: 'Student deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.studentService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
