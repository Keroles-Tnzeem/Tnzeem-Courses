import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RoundStatusEnum } from '../../enums/round-status.enum';

export class QueryRoundRequest {
    @ApiPropertyOptional({ default: 1 })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Filter by course ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @IsOptional()
    courseId?: number;

    @ApiPropertyOptional({ enum: RoundStatusEnum, description: 'Filter by status' })
    @IsEnum(RoundStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    status?: RoundStatusEnum;

    @ApiPropertyOptional({ enum: ['round_number', 'start_date', 'created_at'], default: 'round_number' })
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    sortBy?: string = 'round_number';

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
