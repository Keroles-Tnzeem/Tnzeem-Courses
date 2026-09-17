import { SourceEntity } from '../../entities/source.entity';

export class SourceResponse {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  static from(entity: SourceEntity): SourceResponse {
    const response = new SourceResponse();
    response.id = entity.id;
    response.name = entity.name;
    response.createdAt = entity.audit.createdAt;
    response.updatedAt = entity.audit.updatedAt;
    return response;
  }
}
