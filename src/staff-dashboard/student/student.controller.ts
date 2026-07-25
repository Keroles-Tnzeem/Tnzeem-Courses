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
    async findAll(@Query() query: PaginationRequest) {
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

    // GET /staff-dashboard/student/:id
    @Permissions('students.view')
    @Get(':id')
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

    // DELETE /staff-dashboard/student/:id
    @Permissions('students.delete')
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.studentService.remove(id);
        return ApiResponseDto.success(
            null,
            this.i18n.t('common.deleted', { lang: this.lang() }),
        );
    }
}
