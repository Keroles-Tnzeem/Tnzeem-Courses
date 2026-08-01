import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRoundSessionRequest } from './create-round-session.request';

export class UpdateRoundSessionRequest extends PartialType(
    OmitType(CreateRoundSessionRequest, ['roundId'] as const),
) {}
