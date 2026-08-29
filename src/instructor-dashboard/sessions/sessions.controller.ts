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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrainerGuard } from '../../common/guards/trainer.guard';
import { Trainer } from '../../common/decorators/trainer.decorator';
import { JwtPayload } from '../../shared/auth/services/jwt.service';
import { InstructorSessionsService } from './sessions.service';
import { CreateSessionRequest } from './dto/requests/create-session.request';
import { UpdateSessionRequest } from './dto/requests/update-session.request';
import { QuerySessionRequest } from './dto/requests/query-session.request';
import { SessionResponse } from './dto/responses/session.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { I18nService } from 'nestjs-i18n';
import { getLang } from '../../common/helpers/lang.helper';

@ApiTags('Instructor Dashboard / Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TrainerGuard)
@Controller('instructor-dashboard/round-sessions')
export class InstructorSessionsController {
  constructor(
    private readonly sessionsService: InstructorSessionsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Create a new session for one of your rounds' })
  @ApiResponse({ status: 201, type: SessionResponse })
  async create(
    @Trainer() trainer: JwtPayload,
    @Body() request: CreateSessionRequest,
  ) {
    const data = await this.sessionsService.create(trainer.sub, request);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.created', { lang: getLang() }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List sessions for your rounds' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findAll(
    @Trainer() trainer: JwtPayload,
    @Query() query: QuerySessionRequest,
  ) {
    const res = await this.sessionsService.findAll(trainer.sub, query);
    res.message = this.i18n.t('common.success', { lang: getLang() });
    return res;
  }

  @Get('by-round/:roundId')
  @ApiOperation({ summary: 'List sessions specifically by round ID' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findByRound(
    @Trainer() trainer: JwtPayload,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Query() query: QuerySessionRequest,
  ) {
    query.roundId = roundId;
    const res = await this.sessionsService.findAll(trainer.sub, query);
    res.message = this.i18n.t('common.success', { lang: getLang() });
    return res;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific session' })
  @ApiResponse({ status: 200, type: SessionResponse })
  async findOne(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.sessionsService.findOne(trainer.sub, id);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({ status: 200, type: SessionResponse })
  async update(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateSessionRequest,
  ) {
    const data = await this.sessionsService.update(trainer.sub, id, request);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.updated', { lang: getLang() }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a session' })
  @ApiResponse({ status: 200 })
  async remove(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.sessionsService.remove(trainer.sub, id);
    return ApiResponseDto.success(
      null,
      this.i18n.t('common.deleted', { lang: getLang() }),
    );
  }
}
