import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';

import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { Throttle } from '@nestjs/throttler';
import { ContactUsService } from './contact-us.service';
import { CreateInquiryRequest } from './dto/requests/create-inquiry.request';
import { InquiryResponse } from './dto/responses/inquiry.response';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { getLang } from '../../../common/helpers/lang.helper';

@ApiTags('Website - Contact Us')
@Controller('website/contact-us')
export class ContactUsController {
  constructor(
    private readonly contactUsService: ContactUsService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @UseInterceptors(NoFilesInterceptor())
  @Throttle({ default: { ttl: 60_000, limit: 5 } }) // 5 submissions per minute per IP
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a contact-us / course inquiry' })
  @ApiCreatedResponse({ description: 'Inquiry created', type: InquiryResponse })
  @ApiNotFoundResponse({ description: 'Course not found or not published' })
  async create(
    @Body() request: CreateInquiryRequest,
  ): Promise<ApiResponseDto<InquiryResponse>> {
    const data = await this.contactUsService.create(request);
    return ApiResponseDto.success(
      data,
      this.i18n.t('common.success', { lang: getLang() }),
    );
  }
}
