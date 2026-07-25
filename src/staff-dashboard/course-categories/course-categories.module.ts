import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseCategoriesService } from './course-categories.service';
import { CourseCategoriesController } from './course-categories.controller';
import { CourseCategoryEntity } from './entities/course-category.entity';
import { StorageModule } from '../../shared/storage/storage.module';

@Module({
    imports: [TypeOrmModule.forFeature([CourseCategoryEntity]), StorageModule],
    controllers: [CourseCategoriesController],
    providers: [CourseCategoriesService],
    exports: [CourseCategoriesService],
})
export class CourseCategoriesModule {}
