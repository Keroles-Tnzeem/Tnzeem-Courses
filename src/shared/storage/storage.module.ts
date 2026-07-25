import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageStrategyResolver } from './resolvers/storage-strategy.resolver';
import { DigitalOceanStorageStrategy } from './strategies/digitalocean-storage.strategy';
import { VimeoStorageStrategy } from './strategies/vimeo-storage.strategy';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';

@Module({
    providers: [
        StorageService,
        StorageStrategyResolver,
        DigitalOceanStorageStrategy,
        VimeoStorageStrategy,
        LocalStorageStrategy,
    ],
    exports: [StorageService],
})
export class StorageModule {}
