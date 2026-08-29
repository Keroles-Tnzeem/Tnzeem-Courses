import { PartialType } from '@nestjs/swagger';
import { CreateRoundRequest } from './create-round.request';

export class UpdateRoundRequest extends PartialType(CreateRoundRequest) {}
