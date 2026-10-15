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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TrainerGuard } from '../../../common/guards/trainer.guard';
import { Trainer } from '../../../common/decorators/trainer.decorator';
import { JwtPayload } from '../../../shared/auth/services/jwt.service';
import { InstructorSessionsService } from './sessions.service';
import { CreateSessionRequest } from './dto/requests/create-session.request';
import { UpdateSessionRequest } from './dto/requests/update-session.request';
import { QuerySessionRequest } from './dto/requests/query-session.request';
import { RoundSessionEntity } from '../../staff-dashboard/round-sessions/entities/round-session.entity';
import { SessionResponse } from './dto/responses/session.response';
import { PaginationResponseDto } from '../../../common/dto/responses/pagination.response';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { I18nService } from 'nestjs-i18n';
import { getLang } from '../../../common/helpers/lang.helper';

@ApiTags('Instructor Dashboard / Sessions')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Missing or invalid token' })
@ApiResponse({ status: 403, description: 'Only instructors can access this resource' })
@UseGuards(JwtAuthGuard, TrainerGuard)
@Controller('instructor-dashboard/round-sessions')
export class InstructorSessionsController {
  constructor(
    private readonly sessionsService: InstructorSessionsService,
    private readonly i18n: I18nService,
  ) {}

  private paginate(data: RoundSessionEntity[], total: number, query: QuerySessionRequest) {
    const limit = query.limit ?? 10;
    const page = Math.floor((query.offset ?? 0) / limit) + 1;
    return PaginationResponseDto.success(
      data.map((e) => SessionResponse.fromEntity(e)),
      total,
      page,
      limit,
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }

  @Post()
  @ApiResponse({ status: 400, description: 'Validation failed or session number already taken' })
  @ApiResponse({ status: 404, description: 'Round not found or not yours' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({ summary: 'Create a new session for one of your rounds' })
  @ApiResponse({ status: 201, type: SessionResponse })
  async create(
    @Trainer() trainer: JwtPayload,
    @Body() request: CreateSessionRequest,
  ) {
    const data = await this.sessionsService.create(trainer.sub, request);
    return ApiResponseDto.success(
      SessionResponse.fromEntity(data),
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
    const { data, total } = await this.sessionsService.findAll(trainer.sub, query);
    return this.paginate(data, total, query);
  }

  @Get('by-round/:roundId')
  @ApiParam({ name: 'roundId', type: Number })
  @ApiResponse({ status: 404, description: 'Round not found or not yours' })
  @ApiOperation({ summary: 'List sessions specifically by round ID' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findByRound(
    @Trainer() trainer: JwtPayload,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Query() query: QuerySessionRequest,
  ) {
    const { data, total } = await this.sessionsService.findByRound(trainer.sub, roundId, query);
    return this.paginate(data, total, query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 404, description: 'Session not found or not yours' })
  @ApiOperation({ summary: 'Get a specific session' })
  @ApiResponse({ status: 200, type: SessionResponse })
  async findOne(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.sessionsService.findOne(trainer.sub, id);
    return ApiResponseDto.success(
      SessionResponse.fromEntity(data),
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 404, description: 'Session not found or not yours' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({ status: 200, type: SessionResponse })
  async update(
    @Trainer() trainer: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UpdateSessionRequest,
  ) {
    const data = await this.sessionsService.update(trainer.sub, id, request);
    return ApiResponseDto.success(
      SessionResponse.fromEntity(data),
      this.i18n.t('common.updated', { lang: getLang() }),
    );
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 404, description: 'Session not found or not yours' })
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
