import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GuestCourseCategoriesService } from './course-categories.service';
import { CourseCategoryResponse } from '../../../staff-dashboard/course-categories/dto/responses/course-category.response';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';

@ApiTags('Website - Guest - Course Categories')
@Controller('website/course-categories')
export class GuestCourseCategoriesController {
    constructor(
        private readonly courseCategoriesService: GuestCourseCategoriesService,
        private readonly i18n: I18nService,
    ) {}

    private lang(queryLang?: string, headerLang?: string): string {
        return queryLang || headerLang || I18nContext.current()?.lang || 'en';
    }

    @Get()
    @ApiOperation({ summary: 'List all course categories without pagination' })
    @ApiQuery({ name: 'lang', required: false, description: 'Language (e.g. ar or en)' })
    @ApiOkResponse({ type: CourseCategoryResponse, isArray: true })
    async findAll(
        @Query('lang') queryLang?: string,
        @Headers('lang') headerLang?: string,
        @Headers('x-lang') xLang?: string,
    ): Promise<ApiResponseDto<CourseCategoryResponse[]>> {
        const lang = this.lang(queryLang, headerLang || xLang);
        const categories = await this.courseCategoriesService.findAll();
        const data = categories.map(c => CourseCategoryResponse.from(c, lang));
        return ApiResponseDto.success(
            data,
            this.i18n.t('common.success', { lang: lang })
        );
    }
}
