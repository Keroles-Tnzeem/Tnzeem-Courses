import { IsEmail, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

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
}
