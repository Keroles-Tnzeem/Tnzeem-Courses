import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';
import { TrainerInfoEntity } from '../../shared/user/entities/trainer-info.entity';
import { CourseCategoryEntity } from '../course-categories/entities/course-category.entity';
import { StorageModule } from '../../shared/storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CourseEntity,
            TrainerInfoEntity,
            CourseCategoryEntity
        ]),
        StorageModule
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService]
})
export class CoursesModule {}
