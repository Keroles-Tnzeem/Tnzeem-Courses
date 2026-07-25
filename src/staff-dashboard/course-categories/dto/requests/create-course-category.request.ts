import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class TranslationDto {
    @ApiProperty()
    @IsString()
    ar: string;

    @ApiProperty()
    @IsString()
    en: string;
}

export class CreateCourseCategoryRequest {
    @ApiProperty({ type: TranslationDto })
    @IsObject()
    @ValidateNested()
    @Type(() => TranslationDto)
    name: { ar: string; en: string };

    @ApiProperty({ type: TranslationDto })
    @IsObject()
    @ValidateNested()
    @Type(() => TranslationDto)
    description: { ar: string; en: string };

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    image?: string;
}
