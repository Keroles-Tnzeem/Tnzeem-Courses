import { UploadResponse } from '../dto/upload-response.dto';
import { UploadType } from '../enums/upload-type.enum';

export interface StorageProvider {
    upload(file: any, uploadType?: UploadType): Promise<UploadResponse>;
    delete(key: string): Promise<void>;
    exists?(key: string): Promise<boolean>;
    getUrl?(key: string): Promise<string>;
}
