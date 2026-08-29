import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrainerGuard } from '../../common/guards/trainer.guard';
import { Trainer } from '../../common/decorators/trainer.decorator';
import { InstructorCoursesService } from './courses.service';
import { CreateCourseRequest } from './dto/requests/create-course.request';
import { UpdateCourseRequest } from './dto/requests/update-course.request';
import { QueryCourseRequest } from './dto/requests/query-course.request';
import { CourseResponse } from './dto/responses/course.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { JwtPayload } from '../../shared/auth/services/jwt.service';

@ApiTags('Instructor Dashboard / Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TrainerGuard)
@Controller('instructor-dashboard/courses')
export class InstructorCoursesController {
  constructor(private readonly coursesService: InstructorCoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiResponse({ status: 201, type: CourseResponse })
  async create(
    @Trainer() trainer: JwtPayload,
    @Body() request: CreateCourseRequest,
  ): Promise<CourseResponse> {
    return this.coursesService.create(
      trainer.sub,
      request,
      request.image,
      request.introVideo,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List instructor courses' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findAll(
    @Trainer() trainer: JwtPayload,
    @Query() query: QueryCourseRequest,
  ): Promise<PaginationResponseDto<CourseResponse>> {
    return this.coursesService.findAll(trainer.sub, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course details by ID' })
  @ApiResponse({ status: 200, type: CourseResponse })
  async findOne(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CourseResponse> {
    return this.coursesService.findOne(trainer.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course details' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiResponse({ status: 200, type: CourseResponse })
  async update(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateCourseRequest,
  ): Promise<CourseResponse> {
    return this.coursesService.update(
      trainer.sub,
      id,
      request,
      request.image,
      request.introVideo,
    );
  }
}
