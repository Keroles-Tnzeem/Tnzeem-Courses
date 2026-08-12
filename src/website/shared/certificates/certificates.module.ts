import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { EnrollmentsModule } from '../../../shared/enrollments/enrollments.module';

@Module({
    imports: [EnrollmentsModule],
    controllers: [CertificatesController],
})
export class CertificatesModule {}
