import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CertificateResponse } from './dto/responses/certificate.response';
import { ApiResponseDto } from '../../common/dto/responses/api.response';

@ApiTags('Public / Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) {}

    @Get('verify-certificate/:certificateSerialNum')
    @ApiOperation({ summary: 'Verify a certificate by its serial number' })
    @ApiParam({ name: 'certificateSerialNum', type: String, description: 'Certificate Serial Number' })
    @ApiResponse({ status: 200, type: CertificateResponse })
    @ApiResponse({ status: 404, description: 'Certificate not found' })
    async verifyCertificate(
        @Param('certificateSerialNum') certificateSerialNum: string,
    ): Promise<ApiResponseDto<CertificateResponse>> {
        const certificate = await this.enrollmentsService.verifyCertificate(certificateSerialNum);
        return ApiResponseDto.success(certificate);
    }
}
