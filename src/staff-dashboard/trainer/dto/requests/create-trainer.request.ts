import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

export class CreateTrainerRequest {
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    firstName: string;

    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    lastName: string;

    @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    email: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    phone?: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    password?: string;

    @IsEnum(GenderEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    gender: GenderEnum;

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
