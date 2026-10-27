import {
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { GenderEnum } from '../../../../../shared/user/enums/gender.enum';

export class UpdateTrainerRequest {
    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    firstName?: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    lastName?: string;

    @IsOptional()
    @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
    email?: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    phone?: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @MinLength(6, { message: i18nValidationMessage('validation.MIN_LENGTH') })
    password?: string;

    @IsOptional()
    @IsEnum(GenderEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    gender?: GenderEnum;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    age?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    numExperience?: number;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    experience?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
    numCourses?: number;

    @IsOptional()
    @Transform(({ obj, key, value }) => {
        const raw = obj && key in obj ? obj[key] : value;
        if (raw === '0' || raw === 0 || raw === 'false' || raw === false) return false;
        if (raw === '1' || raw === 1 || raw === 'true' || raw === true) return true;
        return value;
    })
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    isActive?: boolean;
}
