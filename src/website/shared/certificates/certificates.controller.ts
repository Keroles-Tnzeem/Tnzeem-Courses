import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { EnrollmentsService } from '../../../shared/enrollments/enrollments.service';
import { CertificateResponse } from '../../../shared/enrollments/dto/responses/certificate.response';
import { ApiResponseDto } from '../../../common/dto/responses/api.response';
import { getLang } from '../../../common/helpers/lang.helper';

@ApiTags('Website - Certificates')
@Controller('website/verify-certificate')
export class CertificatesController {
    constructor(
        private readonly enrollmentsService: EnrollmentsService,
        private readonly i18n: I18nService,
    ) {}

    @Get(':cerNum')
    @ApiOperation({ summary: 'Verify a certificate by its serial number' })
    @ApiParam({ name: 'cerNum', type: String, description: 'Certificate serial number' })
    @ApiOkResponse({ type: CertificateResponse })
    async verifyCertificate(
        @Param('cerNum') cerNum: string,
    ): Promise<ApiResponseDto<CertificateResponse>> {
        const data = await this.enrollmentsService.verifyCertificate(cerNum);
        return ApiResponseDto.success(
            data,
            this.i18n.t('common.success', { lang: getLang() }),
        );
    }
}
