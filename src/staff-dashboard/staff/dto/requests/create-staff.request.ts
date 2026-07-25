import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { UserTypeEnum } from '../../../../shared/user/enums/user-type.enum';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

export class CreateStaffRequest {
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

    @IsEnum(GenderEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    gender: GenderEnum;

    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    password: string;

    @IsEnum([UserTypeEnum.SALES, UserTypeEnum.SUPPORT], {
        message: i18nValidationMessage('validation.IS_STAFF_TYPE'),
    })
    userType: UserTypeEnum.SALES | UserTypeEnum.SUPPORT;

    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @IsNumber({}, { each: true })
    permissionIds?: number[];
}
