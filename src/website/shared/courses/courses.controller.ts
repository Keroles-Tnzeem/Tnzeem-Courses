import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GuestCoursesService } from './courses.service';
import { GuestCourseResponse } from './dto/responses/guest-course.response';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { Lang } from '../../../common/decorators/lang.decorator';
import { QueryCoursesRequest } from './dto/requests/query-courses.request';

@ApiTags('Website - Guest - Courses')
@Controller('website')
export class GuestCoursesController {
  constructor(
    private readonly coursesService: GuestCoursesService,
    private readonly i18n: I18nService,
  ) {}

  @Get('courses')
  @ApiOperation({ summary: 'List all courses without rounds' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language (e.g. ar or en)',
  })
  @ApiOkResponse({ type: GuestCourseResponse, isArray: true })
  async findAll(
    @Query() query: QueryCoursesRequest,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<GuestCourseResponse[]>> {
    const courses = await this.coursesService.findAll(query);
    const data = courses.map((c) => GuestCourseResponse.from(c, lang));
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang }),
    );
  }

  @Get('courses/:courseSlug')
  @ApiOperation({ summary: 'Get course details by slug' })
  @ApiParam({
    name: 'courseSlug',
    type: String,
    description: 'Slug of the course',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language (e.g. ar or en)',
  })
  @ApiOkResponse({ type: GuestCourseResponse })
  async findOne(
    @Param('courseSlug') courseSlug: string,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<GuestCourseResponse>> {
    const course = await this.coursesService.findOneBySlug(courseSlug);

    if (!course) {
      throw new NotFoundException({
        message: this.i18n.t('errors.COURSE_NOT_FOUND', { lang }),
        error: lang === 'ar' ? 'غير موجود' : 'Not Found',
        statusCode: 404,
      });
    }

    const data = GuestCourseResponse.from(course, lang);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang }),
    );
  }
}
