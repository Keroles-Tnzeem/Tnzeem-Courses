import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InstructorMenuService } from './menu.service';
import { CourseMenuResponse } from './dto/responses/course-menu.response';
import { RoundMenuResponse } from './dto/responses/round-menu.response';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrainerGuard } from '../../common/guards/trainer.guard';
import { Trainer } from '../../common/decorators/trainer.decorator';
import { Lang } from '../../common/decorators/lang.decorator';
import { JwtPayload } from '../../shared/auth/services/jwt.service';

@ApiTags('Instructor Dashboard / Menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TrainerGuard)
@Controller('instructor-dashboard/menu')
export class InstructorMenuController {
  constructor(private readonly menuService: InstructorMenuService) {}

  @Get('courses')
  @ApiOkResponse({ type: CourseMenuResponse, isArray: true })
  async getCoursesMenu(
    @Trainer() trainer: JwtPayload,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<CourseMenuResponse[]>> {
    const data = await this.menuService.getCoursesMenu(trainer.sub, lang);
    return ApiResponseDto.success(data);
  }

  @Get('rounds')
  @ApiOkResponse({ type: RoundMenuResponse, isArray: true })
  async getRoundsMenu(
    @Trainer() trainer: JwtPayload,
    @Lang() lang: string,
  ): Promise<ApiResponseDto<RoundMenuResponse[]>> {
    const data = await this.menuService.getRoundsMenu(trainer.sub, lang);
    return ApiResponseDto.success(data);
  }
}
