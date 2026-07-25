export class UploadResponse {
    provider: string;
    key: string;
    url: string;
    mimeType?: string;
    size?: number;
    metadata?: Record<string, any>;
}
