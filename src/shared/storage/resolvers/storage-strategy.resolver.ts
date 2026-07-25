import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UploadType } from '../enums/upload-type.enum';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { DigitalOceanStorageStrategy } from '../strategies/digitalocean-storage.strategy';
import { VimeoStorageStrategy } from '../strategies/vimeo-storage.strategy';
import { LocalStorageStrategy } from '../strategies/local-storage.strategy';

@Injectable()
export class StorageStrategyResolver {
    constructor(
        private readonly digitalOceanStrategy: DigitalOceanStorageStrategy,
        private readonly vimeoStrategy: VimeoStorageStrategy,
        private readonly localStrategy: LocalStorageStrategy,
    ) {}

    resolve(uploadType: UploadType): StorageProvider {
        // Defaulting to local strategy for testing right now.
        return this.localStrategy;
        
        /* 
        switch (uploadType) {
            case UploadType.IMAGE:
            case UploadType.DOCUMENT:
            case UploadType.FILE:
                return this.digitalOceanStrategy;
            case UploadType.VIDEO:
                return this.vimeoStrategy;
            default:
                throw new InternalServerErrorException(`No storage strategy configured for upload type: ${uploadType}`);
        }
        */
    }
}
