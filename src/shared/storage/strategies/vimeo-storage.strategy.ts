import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { UploadResponse } from '../dto/upload-response.dto';
import { UploadType } from '../enums/upload-type.enum';

@Injectable()
export class VimeoStorageStrategy implements StorageProvider {
    async upload(file: any, uploadType?: UploadType): Promise<UploadResponse> {
        return {
            provider: 'vimeo',
            key: `vimeo-${Date.now()}`,
            url: `https://vimeo.com/123456789`,
            mimeType: file.mimetype,
            size: file.size,
        };
    }

    async delete(key: string): Promise<void> {}
    async getUrl(key: string): Promise<string> { return `https://vimeo.com/${key}`; }
}
