import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestCoursesService } from './courses.service';
import { GuestCoursesController } from './courses.controller';
import { CourseEntity } from '../../../staff-dashboard/courses/entities/course.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CourseEntity])],
    controllers: [GuestCoursesController],
    providers: [GuestCoursesService],
})
export class GuestCoursesModule {}
