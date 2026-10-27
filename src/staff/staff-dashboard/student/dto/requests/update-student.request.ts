import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GenderEnum } from '../../../../../shared/user/enums/gender.enum';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';

export class UpdateStudentRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsSaudiPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ enum: GenderEnum })
  @IsOptional()
  @IsEnum(GenderEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  gender?: GenderEnum;

  @ApiPropertyOptional({ minLength: 6, example: 'secret123' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(6, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  password?: string;

  @ApiPropertyOptional({
    enum: OrderStatusEnum,
    example: OrderStatusEnum.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  status?: OrderStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  sourceId?: number;

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @Transform(({ obj, key, value }) => {
    const raw = obj && key in obj ? obj[key] : value;
    if (raw === 'false' || raw === false) return false;
    if (raw === 'true' || raw === true) return true;
    return value;
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  isActive?: boolean;
}
