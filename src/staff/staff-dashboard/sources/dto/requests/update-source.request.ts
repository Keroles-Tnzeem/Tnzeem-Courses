import { PartialType } from '@nestjs/swagger';
import { CreateSourceRequest } from './create-source.request';

export class UpdateSourceRequest extends PartialType(CreateSourceRequest) {}