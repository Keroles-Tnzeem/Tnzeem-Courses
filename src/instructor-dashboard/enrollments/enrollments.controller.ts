import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { InstructorEnrollmentsService } from './enrollments.service';
import { CreateEnrollmentRequest } from './dto/requests/create-enrollment.request';
import { UpdateEnrollmentRequest } from './dto/requests/update-enrollment.request';
import { QueryEnrollmentRequest } from './dto/requests/query-enrollment.request';
import { EnrollmentResponse } from './dto/responses/enrollment.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { I18nService } from 'nestjs-i18n';
import { getLang } from '../../common/helpers/lang.helper';

@ApiTags('Instructor Dashboard / Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TrainerGuard)
@Controller('instructor-dashboard/enrollments')
export class InstructorEnrollmentsController {
  constructor(
    private readonly enrollmentsService: InstructorEnrollmentsService,
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
  @ApiOperation({ summary: 'Manually enroll a student in one of your rounds' })
  @ApiResponse({ status: 201, type: EnrollmentResponse })
  async create(
    @Trainer() trainer: JwtPayload,
    @Body() request: CreateEnrollmentRequest,
  ) {
    const data = await this.enrollmentsService.create(trainer.sub, request);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.created', { lang: getLang() }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List enrollments across your rounds' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findAll(
    @Trainer() trainer: JwtPayload,
    @Query() query: QueryEnrollmentRequest,
  ) {
    const res = await this.enrollmentsService.findAll(trainer.sub, query);
    res.message = this.i18n.t('common.success', { lang: getLang() });
    return res;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific enrollment' })
  @ApiResponse({ status: 200, type: EnrollmentResponse })
  async findOne(
    @Trainer() trainer: JwtPayload,
    @Param('id') id: string,
  ) {
    const data = await this.enrollmentsService.findOne(trainer.sub, id);
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
  @ApiOperation({ summary: 'Update enrollment status (e.g. mark as COMPLETED to generate certificate)' })
  @ApiResponse({ status: 200, type: EnrollmentResponse })
  async update(
    @Trainer() trainer: JwtPayload,
    @Param('id') id: string,
    @Body() request: UpdateEnrollmentRequest,
  ) {
    const data = await this.enrollmentsService.update(trainer.sub, id, request);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.updated', { lang: getLang() }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an enrollment' })
  @ApiResponse({ status: 200 })
  async remove(
    @Trainer() trainer: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.enrollmentsService.remove(trainer.sub, id);
    return ApiResponseDto.success(
      null,
      this.i18n.t('common.deleted', { lang: getLang() }),
    );
  }
}
