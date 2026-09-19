import { IsEmail, IsEnum, IsBoolean, IsOptional, IsString, IsArray, IsNumber, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { UserTypeEnum } from '../../../../../shared/user/enums/user-type.enum';
import { GenderEnum } from '../../../../../shared/user/enums/gender.enum';

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
    @MinLength(6, { message: i18nValidationMessage('validation.MIN_LENGTH') })
    password?: string;

    @IsOptional()
    @IsEnum([UserTypeEnum.SALES, UserTypeEnum.SUPPORT], {
        message: i18nValidationMessage('validation.IS_STAFF_TYPE'),
    })
    userType?: UserTypeEnum.SALES | UserTypeEnum.SUPPORT;

    @IsOptional()
    @IsArray({ message: i18nValidationMessage('validation.IS_ARRAY') })
    @Type(() => Number)
    @IsNumber({}, { each: true, message: i18nValidationMessage('validation.IS_NUMBER') })
    permissionIds?: number[];

    @IsOptional()
    @Transform(({ value }) => {
        if (value === '0' || value === 0 || value === 'false') return false;
        if (value === '1' || value === 1 || value === 'true') return true;
        return value;
    })
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    isActive?: boolean;
}
