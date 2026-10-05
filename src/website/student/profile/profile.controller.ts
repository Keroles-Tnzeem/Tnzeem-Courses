import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { StudentGuard } from '../../../common/guards/student.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { getLang } from '../../../common/helpers/lang.helper';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { ProfileService } from './profile.service';
import { UpdateStudentProfileRequest } from './dto/requests/update-student-profile.request';
import { UpdateStudentPhoneRequest } from './dto/requests/update-student-phone.request';
import { StudentProfileResponse } from './dto/responses/student-profile.response';

@ApiTags('Website - Student Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StudentGuard)
@Controller('website/student/profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly i18n: I18nService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated student profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated student profile',
    type: StudentProfileResponse,
  })
  async getProfile(
    @CurrentUser('sub') studentId: number,
  ): Promise<ApiResponseDto<StudentProfileResponse>> {
    const data = await this.profileService.getProfile(studentId);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }

  @Patch()
  @UseInterceptors(FileInterceptor('img'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update the authenticated student profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated student profile',
    type: StudentProfileResponse,
  })
  async updateProfile(
    @CurrentUser('sub') studentId: number,
    @Body() request: UpdateStudentProfileRequest,
    @UploadedFile() img?: Express.Multer.File,
  ): Promise<ApiResponseDto<StudentProfileResponse>> {
    const data = await this.profileService.updateProfile(
      studentId,
      request,
      img,
    );
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.updated', { lang: getLang() }),
    );
  }

  @Patch('phone')
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({
    summary: 'Update the authenticated student phone number',
    description:
      'The phone must be unique. The new number is marked as unverified.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated student profile',
    type: StudentProfileResponse,
  })
  @ApiResponse({ status: 409, description: 'Phone number already in use' })
  async updatePhone(
    @CurrentUser('sub') studentId: number,
    @Body() request: UpdateStudentPhoneRequest,
  ): Promise<ApiResponseDto<StudentProfileResponse>> {
    const data = await this.profileService.updatePhone(studentId, request);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.updated', { lang: getLang() }),
    );
  }
}
