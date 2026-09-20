import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PartialTranslationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  ar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  en?: string;
}

export class UpdateCourseCategoryRequest {
  @ApiPropertyOptional({ type: PartialTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialTranslationDto)
  name?: PartialTranslationDto;

  @ApiPropertyOptional({ type: PartialTranslationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialTranslationDto)
  description?: PartialTranslationDto;

  @ApiPropertyOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  image?: string;
}
