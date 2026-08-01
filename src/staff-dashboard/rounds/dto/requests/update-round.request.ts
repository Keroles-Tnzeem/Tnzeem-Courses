import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRoundRequest } from './create-round.request';

export class UpdateRoundRequest extends PartialType(
    OmitType(CreateRoundRequest, ['courseId'] as const),
) {}
