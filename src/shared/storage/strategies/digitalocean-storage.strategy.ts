import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { UploadResponse } from '../dto/upload-response.dto';
import { UploadType } from '../enums/upload-type.enum';

@Injectable()
export class DigitalOceanStorageStrategy implements StorageProvider {
    async upload(file: any, uploadType?: UploadType): Promise<UploadResponse> {
        return {
            provider: 'digitalocean',
            key: `do-${Date.now()}-${file.originalname}`,
            url: `https://example-do-space.com/${file.originalname}`,
            mimeType: file.mimetype,
            size: file.size,
        };
    }

    async delete(key: string): Promise<void> {}
    async exists(key: string): Promise<boolean> { return true; }
    async getUrl(key: string): Promise<string> { return `https://example-do-space.com/${key}`; }
}
