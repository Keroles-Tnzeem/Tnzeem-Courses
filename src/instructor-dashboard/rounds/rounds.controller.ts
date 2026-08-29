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
import { JwtPayload } from '../../shared/auth/services/jwt.service';
import { InstructorRoundsService } from './rounds.service';
import { CreateRoundRequest } from './dto/requests/create-round.request';
import { UpdateRoundRequest } from './dto/requests/update-round.request';
import { QueryRoundRequest } from './dto/requests/query-round.request';
import { RoundResponse } from './dto/responses/round.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { I18nService } from 'nestjs-i18n';
import { getLang } from '../../common/helpers/lang.helper';

@ApiTags('Instructor Dashboard / Rounds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TrainerGuard)
@Controller('instructor-dashboard/rounds')
export class InstructorRoundsController {
  constructor(
    private readonly roundsService: InstructorRoundsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new round' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiResponse({ status: 201, type: RoundResponse })
  async create(
    @Trainer() trainer: JwtPayload,
    @Body() request: CreateRoundRequest,
  ) {
    const data = await this.roundsService.create(trainer.sub, request);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.created', { lang: getLang() }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List instructor rounds' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findAll(
    @Trainer() trainer: JwtPayload,
    @Query() query: QueryRoundRequest,
  ) {
    const res = await this.roundsService.findAll(trainer.sub, query);
    res.message = this.i18n.t('common.success', { lang: getLang() });
    return res;
  }

  @Get('by-course/:courseId')
  @ApiOperation({ summary: 'Get all rounds for a specific course (ordered by round number)' })
  @ApiResponse({ status: 200, type: RoundResponse, isArray: true })
  async findByCourse(
    @Trainer() trainer: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    const data = await this.roundsService.findByCourse(trainer.sub, courseId);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific round' })
  @ApiResponse({ status: 200, type: RoundResponse })
  async findOne(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.roundsService.findOne(trainer.sub, id);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a round' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiResponse({ status: 200, type: RoundResponse })
  async update(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateRoundRequest,
  ) {
    const data = await this.roundsService.update(trainer.sub, id, request);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.updated', { lang: getLang() }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a round' })
  @ApiResponse({ status: 200 })
  async remove(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.roundsService.remove(trainer.sub, id);
    return ApiResponseDto.success(
      null,
      this.i18n.t('common.deleted', { lang: getLang() }),
    );
  }
}
