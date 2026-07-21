import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { UserTypeEnum } from '../../../../shared/user/enums/user-type.enum';

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

    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
    password: string;

    @IsEnum([UserTypeEnum.SALES, UserTypeEnum.SUPPORT], {
        message: i18nValidationMessage('validation.IS_STAFF_TYPE'),
    })
    userType: UserTypeEnum.SALES | UserTypeEnum.SUPPORT;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    permissionIds?: number[];
}
