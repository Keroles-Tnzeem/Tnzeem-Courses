import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { SourceEntity } from './entities/source.entity';
import { CreateSourceRequest } from './dto/requests/create-source.request';
import { UpdateSourceRequest } from './dto/requests/update-source.request';
import { QuerySourceRequest } from './dto/requests/query-source.request';
import {getLang} from "../../common/helpers/lang.helper";

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(SourceEntity)
    private readonly sourceRepository: Repository<SourceEntity>,
    private readonly i18n: I18nService,
  ) {}



  async create(dto: CreateSourceRequest): Promise<SourceEntity> {
    const exists = await this.sourceRepository.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new ConflictException(
        this.i18n.t('errors.NAME_TAKEN', { lang: getLang() }),
      );
    }

    const entity = this.sourceRepository.create({ name: dto.name });
    return await this.sourceRepository.save(entity);
  }

  async findAll(
    query: QuerySourceRequest,
  ): Promise<{ data: SourceEntity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const order: any = {};
    if (sortBy === 'name') {
      order.name = sortOrder;
    } else {
      order.id = sortOrder;
    }

    const [data, total] = await this.sourceRepository.findAndCount({
      where,
      skip,
      take: limit,
      order,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<SourceEntity> {
    const entity = await this.sourceRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        this.i18n.t('errors.NOT_FOUND', { lang: getLang() }),
      );
    }
    return entity;
  }

  async update(
    id: number,
    dto: UpdateSourceRequest,
  ): Promise<SourceEntity> {
    const entity = await this.findOne(id);

    if (dto.name && dto.name !== entity.name) {
      const exists = await this.sourceRepository.findOne({
        where: { name: dto.name },
      });
      if (exists) {
        throw new ConflictException(
          this.i18n.t('errors.NAME_TAKEN', { lang: getLang() }),
        );
      }
    }

    Object.assign(entity, dto);
    return await this.sourceRepository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    await this.sourceRepository.remove(entity);
  }
}