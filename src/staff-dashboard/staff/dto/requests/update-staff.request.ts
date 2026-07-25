import { IsEmail, IsEnum, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { UserTypeEnum } from '../../../../shared/user/enums/user-type.enum';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

export class UpdateStaffRequest {
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
    @IsEnum(GenderEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
    gender?: GenderEnum;

    @IsOptional()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    password?: string;

    @IsOptional()
    @IsEnum([UserTypeEnum.SALES, UserTypeEnum.SUPPORT], {
        message: i18nValidationMessage('validation.IS_STAFF_TYPE'),
    })
    userType?: UserTypeEnum.SALES | UserTypeEnum.SUPPORT;

    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @IsNumber({}, { each: true })
    permissionIds?: number[];
}
