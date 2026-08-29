import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSessionRequest } from './create-session.request';

export class UpdateSessionRequest extends PartialType(
  OmitType(CreateSessionRequest, ['roundId'] as const),
) {}
