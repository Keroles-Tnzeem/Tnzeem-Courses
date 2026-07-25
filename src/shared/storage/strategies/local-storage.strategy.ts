import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { UploadResponse } from '../dto/upload-response.dto';
import { UploadType } from '../enums/upload-type.enum';

@Injectable()
export class LocalStorageStrategy implements StorageProvider {
    async upload(file: any, uploadType?: UploadType): Promise<UploadResponse> {
        // In a real local strategy, you'd save the file to disk using fs here.
        // For testing, we mock the response.
        return {
            provider: 'local',
            key: `local-${Date.now()}-${file?.originalname || 'file'}`,
            url: `http://localhost:3000/uploads/${file?.originalname || 'file'}`,
            mimeType: file?.mimetype,
            size: file?.size,
        };
    }

    async delete(key: string): Promise<void> {}
    async exists(key: string): Promise<boolean> { return true; }
    async getUrl(key: string): Promise<string> { return `http://localhost:3000/uploads/${key}`; }
}
