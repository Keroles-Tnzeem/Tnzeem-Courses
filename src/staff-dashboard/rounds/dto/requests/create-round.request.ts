import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { RoundStatusEnum } from '../../enums/round-status.enum';

export class CreateRoundRequest {
    @ApiProperty({ example: 1, description: 'Course ID this round belongs to' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    courseId: number;

    @ApiProperty({ example: 1, description: 'Round number (e.g. 1st run, 2nd run)' })
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    roundNumber: number;

    @ApiPropertyOptional({ example: '2025-01-15', description: 'Round start date' })
    @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE') })
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({ example: '2025-03-15', description: 'Round end date' })
    @IsDateString({}, { message: i18nValidationMessage('validation.IS_DATE') })
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional({ enum: RoundStatusEnum, default: RoundStatusEnum.UPCOMING })
    @IsEnum(RoundStatusEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsOptional()
    status?: RoundStatusEnum;

    @ApiPropertyOptional({ example: true, description: 'Whether to show the round (0/false or 1/true)' })
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    @Transform(({ value }) => {
        if (value === '0' || value === 0 || value === 'false') return false;
        if (value === '1' || value === 1 || value === 'true') return true;
        return value;
    })
    @IsOptional()
    showRound?: boolean;

    @ApiPropertyOptional({ example: 'First run of the course in 2025' })
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsOptional()
    notes?: string;
}
