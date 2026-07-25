import { Injectable } from '@nestjs/common';
import { StorageStrategyResolver } from './resolvers/storage-strategy.resolver';
import { UploadType } from './enums/upload-type.enum';
import { UploadResponse } from './dto/upload-response.dto';

@Injectable()
export class StorageService {
    constructor(private readonly storageStrategyResolver: StorageStrategyResolver) {}

    async upload(file: any, type: UploadType): Promise<UploadResponse> {
        const strategy = this.storageStrategyResolver.resolve(type);
        return await strategy.upload(file, type);
    }

    async delete(key: string, type: UploadType): Promise<void> {
        const strategy = this.storageStrategyResolver.resolve(type);
        return await strategy.delete(key);
    }
}
