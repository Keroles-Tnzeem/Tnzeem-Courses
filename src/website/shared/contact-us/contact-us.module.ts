import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InquiryEntity } from '../../../shared/inquiries/entities/inquiry.entity';
import { CourseEntity } from '../../../staff/staff-dashboard/courses/entities/course.entity';
import { UserEntity } from '../../../shared/user/entities/user.entity';
import { OrderEntity } from '../../../shared/orders/entities/order.entity';
import { SourcesModule } from '../../../staff/staff-dashboard/sources/sources.module';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InquiryEntity,
      CourseEntity,
      UserEntity,
      OrderEntity,
    ]),
    SourcesModule,
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService],
  exports: [ContactUsService], // exported so ProfileModule can inject it
})
export class ContactUsModule {}
