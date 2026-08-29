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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Express } from 'express';
import { CoursesService } from './courses.service';
import { CreateCourseRequest } from './dto/requests/create-course.request';
import { UpdateCourseRequest } from './dto/requests/update-course.request';
import { QueryCourseRequest } from './dto/requests/query-course.request';
import { CourseResponse } from './dto/responses/course.response';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto as PaginationResponse } from '../../common/dto/responses/pagination.response';
import { StorageService } from '../../shared/storage/storage.service';
import { UploadType } from '../../shared/storage/enums/upload-type.enum';
import { Lang } from '../../common/decorators/lang.decorator';

@ApiTags('Courses')
@Controller('staff-dashboard/courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Course' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiResponse({ status: 201, type: CourseResponse })
  async create(
    @Body() dto: CreateCourseRequest,
    @Lang() lang: string,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      introVideo?: Express.Multer.File[];
    },
  ): Promise<ApiResponseDto<CourseResponse>> {
    let image: string | undefined;
    let introVideo: string | undefined;

    if (files?.image?.[0]) {
      const uploaded = await this.storageService.upload(
        files.image[0],
        UploadType.IMAGE,
      );
      image = uploaded.url;
    }
    if (files?.introVideo?.[0]) {
      const uploaded = await this.storageService.upload(
        files.introVideo[0],
        UploadType.VIDEO,
      );
      introVideo = uploaded.url;
    }
    const course = await this.coursesService.create(
      dto,
      lang,
      image,
      introVideo,
    );
    return ApiResponseDto.success(course);
  }

  @Get()
  @ApiOperation({ summary: 'Return paginated courses' })
  @ApiResponse({ status: 200, type: CourseResponse, isArray: true })
  async findAll(
    @Query() query: QueryCourseRequest,
    @Lang() lang: string,
  ): Promise<PaginationResponse<CourseResponse>> {
    return await this.coursesService.findAll(query, lang);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Return a single course with its trainer and category',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CourseResponse })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<CourseResponse>> {
    const course = await this.coursesService.findOne(id, lang);
    return ApiResponseDto.success(course);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: CourseResponse })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseRequest,
    @Lang() lang: string,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      introVideo?: Express.Multer.File[];
    },
  ): Promise<ApiResponseDto<CourseResponse>> {
    let image: string | undefined;
    let introVideo: string | undefined;

    if (files?.image?.[0]) {
      const uploaded = await this.storageService.upload(
        files.image[0],
        UploadType.IMAGE,
      );
      image = uploaded.url;
    }
    if (files?.introVideo?.[0]) {
      const uploaded = await this.storageService.upload(
        files.introVideo[0],
        UploadType.VIDEO,
      );
      introVideo = uploaded.url;
    }
    const course = await this.coursesService.update(
      id,
      dto,
      lang,
      image,
      introVideo,
    );
    return ApiResponseDto.success(course);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete course' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200 })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<null>> {
    await this.coursesService.remove(id, lang);
    return ApiResponseDto.success(null, 'Course deleted successfully');
  }
}
