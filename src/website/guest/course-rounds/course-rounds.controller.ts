import { Controller, Get, Query, Headers, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GuestCourseRoundsService } from './course-rounds.service';
import { GuestCourseRoundResponse } from './dto/responses/guest-course-round.response';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import {getLang} from "../../../common/helpers/lang.helper";
import {QueryCourseRoundsRequest} from "./dto/reauests/query-course-rounds.request";

@ApiTags('Website - Guest - Course Rounds')
@Controller('website')
export class GuestCourseRoundsController {
    constructor(
        private readonly courseRoundsService: GuestCourseRoundsService,
        private readonly i18n: I18nService,
    ) {}

    private lang(queryLang?: string, headerLang?: string): string {
        return queryLang || headerLang || I18nContext.current()?.lang || 'en';
    }

    @Get('courses-rounds')
    @ApiOperation({ summary: 'List all course rounds with course and trainer relations without pagination' })
    @ApiQuery({ name: 'lang', required: false, description: 'Language (e.g. ar or en)' })
    @ApiOkResponse({ type: GuestCourseRoundResponse, isArray: true })
    async findAll(
        @Query() query: QueryCourseRoundsRequest,
    ): Promise<ApiResponseDto<GuestCourseRoundResponse[]>> {
        const lang = getLang();
        const rounds = await this.courseRoundsService.findAll(query);
        const data = rounds.map(r => GuestCourseRoundResponse.from(r, lang));
        return ApiResponseDto.success(
            data,
            this.i18n.t('common.success', { lang: lang })
        );
    }

    @Get('courses/:courseSlug/rounds/:roundId')
    @ApiOperation({ summary: 'Get course round details by course slug and round Id' })
    @ApiParam({ name: 'courseSlug', type: String, description: 'Slug of the course' })
    @ApiParam({ name: 'roundId', type: Number, description: 'Id of the round' })
    @ApiQuery({ name: 'lang', required: false, description: 'Language (e.g. ar or en)' })
    @ApiOkResponse({ type: GuestCourseRoundResponse })
    async findOne(
        @Param('courseSlug') courseSlug: string,
        @Param('roundId', ParseIntPipe) roundId: number): Promise<ApiResponseDto<GuestCourseRoundResponse>> {
        const lang = getLang();
        const round = await this.courseRoundsService.findOneBySlugAndRoundNumber(courseSlug, roundId);
        
        if (!round) {
            throw new NotFoundException({
                message: this.i18n.t('errors.ROUND_NOT_FOUND', { lang }),
                error: lang === 'ar' ? 'غير موجود' : 'Not Found',
                statusCode: 404
            });
        }

        const data = GuestCourseRoundResponse.from(round, lang);
        return ApiResponseDto.success(
            data,
            this.i18n.t('common.success', { lang: lang })
        );
    }
}
