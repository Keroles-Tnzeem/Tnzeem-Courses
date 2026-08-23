import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
} from 'class-validator';
import { GenderEnum } from "../../../../../shared/user/enums/gender.enum";
import { IsSaudiPhoneNumber } from "../../../../../common/validators/saudi-phone.validator";


export class CreateGuestOrderRequest {
    @ApiProperty({ example: 'Ahmed' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Ali' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: '512345678', description: 'Saudi mobile without country code' })
    @IsSaudiPhoneNumber()
    phone: string;

    @ApiPropertyOptional({ example: 'ahmed@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ enum: GenderEnum })
    @IsOptional()
    @IsEnum(GenderEnum)
    gender?: GenderEnum;

    @ApiProperty({ example: 12 })
    @IsInt()
    @IsPositive()
    courseId: number;

    @ApiPropertyOptional({ example: 'order notes' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiPropertyOptional({ example: 'Google' })
    @IsOptional()
    @IsString()
    source?: string;
}