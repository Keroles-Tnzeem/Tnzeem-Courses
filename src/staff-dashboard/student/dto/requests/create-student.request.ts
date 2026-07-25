import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

export class CreateStudentRequest {
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    firstName: string;

    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    lastName: string;

    @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    email: string;

    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    phone: string;

    @IsEnum(GenderEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    gender: GenderEnum;
}

