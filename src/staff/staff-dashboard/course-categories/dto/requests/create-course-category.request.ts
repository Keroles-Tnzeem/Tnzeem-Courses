import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

class TranslationDto {
    @ApiProperty()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    ar: string;

    @ApiProperty()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    en: string;
}

export class CreateCourseCategoryRequest {
    @ApiProperty({ type: TranslationDto })
    @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
    @ValidateNested()
    @Type(() => TranslationDto)
    name: { ar: string; en: string };

    @ApiProperty({ type: TranslationDto })
    @IsObject({ message: i18nValidationMessage('validation.IS_OBJECT') })
    @ValidateNested()
    @Type(() => TranslationDto)
    description: { ar: string; en: string };

    @ApiProperty({ required: false })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    image?: string;
}
