import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { StudentGuard } from '../../../common/guards/student.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Lang } from '../../../common/decorators/lang.decorator';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { PaginationResponseDto as PaginationResponse } from '../../../common/dto/responses/pagination.response';
import { StudentEnrollmentsService } from './enrollments.service';
import { QueryStudentEnrollmentRequest } from './dto/requests/query-student-enrollment.request';
import { StudentEnrollmentResponse } from './dto/responses/student-enrollment.response';
import { StudentEnrollmentDetailsResponse } from './dto/responses/student-enrollment-details.response';

@ApiTags('Website - Student Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentGuard)
@Controller('website/student/enrollments')
export class StudentEnrollmentsController {
  constructor(private readonly enrollmentsService: StudentEnrollmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List the authenticated student enrollments' })
  @ApiResponse({ status: 200, type: StudentEnrollmentResponse, isArray: true })
  async findAll(
    @CurrentUser('sub') studentId: number,
    @Query() query: QueryStudentEnrollmentRequest,
    @Lang() lang: string,
  ): Promise<PaginationResponse<StudentEnrollmentResponse>> {
    return this.enrollmentsService.findAll(studentId, query, lang);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single enrollment of the authenticated student',
  })
  @ApiParam({ name: 'id', type: String, description: 'Enrollment ULID' })
  @ApiResponse({ status: 200, type: StudentEnrollmentDetailsResponse })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async findOne(
    @CurrentUser('sub') studentId: number,
    @Param('id') id: string,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<StudentEnrollmentDetailsResponse>> {
    const enrollment = await this.enrollmentsService.findOne(
      studentId,
      id,
      lang,
    );
    return ApiResponseDto.success(enrollment);
  }
}
