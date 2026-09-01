import { Body, Controller, Get, Patch, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TrainerGuard } from '../../../common/guards/trainer.guard';
import { Trainer } from '../../../common/decorators/trainer.decorator';
import { JwtPayload } from '../../../shared/auth/services/jwt.service';
import { I18nService } from 'nestjs-i18n';
import { getLang } from '../../../common/helpers/lang.helper';
import { HomepageService } from '../services/homepage.service';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { TrainerStatisticsResponse } from '../dto/responses/trainer-statistics.response';
import { TrainerProfileResponse } from '../dto/responses/trainer-profile.response';
import { UpdateTrainerProfileRequest } from '../dto/requests/update-trainer-profile.request';

@ApiTags('Instructor Dashboard / Homepage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TrainerGuard)
@Controller('instructor-dashboard/homepage')
export class HomepageController {
  constructor(
    private readonly homepageService: HomepageService,
    private readonly i18n: I18nService,
  ) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get trainer dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns the statistics for the authenticated trainer',
    type: TrainerStatisticsResponse,
  })
  async getStatistics(@Trainer() trainer: JwtPayload) {
    const data = await this.homepageService.getTrainerStatistics(trainer.sub);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current trainer profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the profile for the authenticated trainer',
    type: TrainerProfileResponse,
  })
  async getProfile(@Trainer() trainer: JwtPayload) {
    const data = await this.homepageService.getTrainerProfile(trainer.sub);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('img'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update current trainer profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated profile for the authenticated trainer',
    type: TrainerProfileResponse,
  })
  async updateProfile(
    @Trainer() trainer: JwtPayload,
    @Body() request: UpdateTrainerProfileRequest,
    @UploadedFile() img?: Express.Multer.File,
  ) {
    const data = await this.homepageService.updateTrainerProfile(trainer.sub, request, img);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.updated', { lang: getLang() }),
    );
  }
}
