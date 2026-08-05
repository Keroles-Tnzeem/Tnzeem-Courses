import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';
import { CourseCategoryEntity } from '../course-categories/entities/course-category.entity';
import { StorageModule } from '../../shared/storage/storage.module';
import { UserEntity } from 'src/shared/user/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CourseEntity,
            UserEntity,
            CourseCategoryEntity
        ]),
        StorageModule
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService]
})
export class CoursesModule {}
