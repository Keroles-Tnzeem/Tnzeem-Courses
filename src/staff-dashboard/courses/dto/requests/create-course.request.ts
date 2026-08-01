import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevelEnum } from '../../../../shared/enums/course-level.enum';

class MultiLingualPropertyDto {
    @ApiProperty({ example: 'دورة نود جي إس' })
    @IsNotEmpty()
    @IsString()
    ar: string;

    @ApiProperty({ example: 'Node.js Course' })
    @IsNotEmpty()
    @IsString()
    en: string;
}

export class CreateCourseRequest {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    trainerId: number;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    categoryId: number;

    @ApiProperty({ type: MultiLingualPropertyDto })
    @ValidateNested()
    @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
    @Type(() => MultiLingualPropertyDto)
    name: MultiLingualPropertyDto;

    @ApiProperty({ type: MultiLingualPropertyDto })
    @ValidateNested()
    @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
    @Type(() => MultiLingualPropertyDto)
    description: MultiLingualPropertyDto;

    @ApiPropertyOptional({
        description: 'HTML content produced by the CKEditor requirements editor',
        example: '<ul><li>Basic JavaScript knowledge</li></ul>',
    })
    @IsOptional()
    @IsString()
    requirements?: string;

    @ApiPropertyOptional({
        description: 'HTML content produced by the CKEditor benefits editor',
        example: '<ul><li>Build a complete API</li></ul>',
    })
    @IsOptional()
    @IsString()
    benefits?: string;

    @ApiProperty({ example: 'node-js-course' })
    @IsNotEmpty()
    @IsString()
    slug: string;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Course thumbnail image' })
    image?: any;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Course introduction video' })
    introVideo?: any;

    @ApiProperty({ example: 10 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    sessionsCount: number;

    @ApiProperty({ example: 20 })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    durationHours: number;

    @ApiProperty({ example: 99.99 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @ApiProperty({
        enum: Object.values(CourseLevelEnum),
        enumName: 'CourseLevel',
        description: 'Course difficulty level',
        example: CourseLevelEnum.BEGINNER,
    })
    @IsEnum(CourseLevelEnum)
    level: CourseLevelEnum;
}
