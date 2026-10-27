import { IsSaudiPhoneNumber } from '../../../../../common/validators/saudi-phone.validator';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GenderEnum } from '../../../../../shared/user/enums/gender.enum';
import { OrderStatusEnum } from '../../../../../shared/orders/enums/order-status.enum';

export class CreateStudentRequest {
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  firstName: string;

  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @MaxLength(50, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  lastName: string;

  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email?: string;

  @IsSaudiPhoneNumber()
  phone: string;

  @IsEnum(GenderEnum, { message: i18nValidationMessage('validation.IS_ENUM') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  gender: GenderEnum;

  @ApiPropertyOptional({
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
    example: OrderStatusEnum.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum, {
    message: i18nValidationMessage('validation.IS_ENUM'),
  })
  status?: OrderStatusEnum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  sourceId?: number;
}
