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
        if (uploadType === UploadType.VIDEO) {
            return this.vimeoStrategy;
        }
        
        // Digital Ocean Spaces is now the default for all other uploads (IMAGE, DOCUMENT, FILE)
        return this.digitalOceanStrategy;
    }
}
