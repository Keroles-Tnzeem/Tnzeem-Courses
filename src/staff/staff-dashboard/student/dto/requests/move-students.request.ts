import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class MoveStudentsRequest {
  @ApiProperty({
    example: 2,
    description: 'User ID of the current staff member (from assignToId)',
  })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  fromAssignToId: number;

  @ApiProperty({
    example: 3,
    description: 'User ID of the target staff member (to assignToId)',
  })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  toAssignToId: number;

  @ApiPropertyOptional({
    type: [Number],
    example: [10, 11],
    description:
      'Optional specific student IDs to move (if omitted, moves all students assigned to fromAssignToId)',
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true, message: i18nValidationMessage('validation.IS_NUMBER') })
  studentIds?: number[];
}
