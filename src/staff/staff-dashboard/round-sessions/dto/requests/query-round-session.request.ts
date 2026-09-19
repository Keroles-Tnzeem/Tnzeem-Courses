import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryRoundSessionRequest {
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

    @ApiPropertyOptional({ description: 'Filter by round ID' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @IsOptional()
    roundId?: number;

    @ApiPropertyOptional({ enum: ['session_number', 'scheduled_at', 'created_at'], default: 'session_number' })
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    sortBy?: string = 'session_number';

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
