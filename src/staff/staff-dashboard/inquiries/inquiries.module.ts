import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryEntity } from '../../../shared/inquiries/entities/inquiry.entity';
import { StaffInquiriesService } from './inquiries.service';
import { StaffInquiriesController } from './inquiries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InquiryEntity])],
  controllers: [StaffInquiriesController],
  providers: [StaffInquiriesService],
})
export class StaffInquiriesModule {}
