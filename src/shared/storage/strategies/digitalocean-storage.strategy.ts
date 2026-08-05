import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { UploadResponse } from '../dto/upload-response.dto';
import { UploadType } from '../enums/upload-type.enum';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { extname } from 'path';

@Injectable()
export class DigitalOceanStorageStrategy implements StorageProvider {
    private readonly logger = new Logger(DigitalOceanStorageStrategy.name);
    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private readonly endpoint: string;

    constructor() {
        this.endpoint = process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com';
        this.bucket = process.env.DO_SPACES_BUCKET || 'my-bucket';
        const region = process.env.DO_SPACES_REGION || 'nyc3';

        this.s3Client = new S3Client({
            endpoint: this.endpoint,
            region,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.DO_SPACES_KEY || '',
                secretAccessKey: process.env.DO_SPACES_SECRET || '',
            },
        });
    }

    async upload(file: any, uploadType?: UploadType): Promise<UploadResponse> {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = extname(file.originalname);
        const prefix = uploadType ? `${uploadType}/` : '';
        const key = `${prefix}${uniqueSuffix}${ext}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        });

        await this.s3Client.send(command);

        // Build the public CDN URL in virtual-hosted style:
        // https://[bucket].[region].digitaloceanspaces.com/[key]
        const doRegion = process.env.DO_SPACES_REGION || 'sfo3';
        const url = `https://${this.bucket}.${doRegion}.digitaloceanspaces.com/${key}`;

        return {
            provider: 'digitalocean',
            key,
            url,
            mimeType: file.mimetype,
            size: file.size,
        };
    }

    async delete(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
        } catch (error) {
            this.logger.error(`Failed to delete file from DO Spaces: ${key}`, error);
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NotFound') return false;
            this.logger.error(`Error checking file existence in DO Spaces: ${key}`, error);
            return false;
        }
    }

    async getUrl(key: string): Promise<string> {
        const doRegion = process.env.DO_SPACES_REGION || 'sfo3';
        return `https://${this.bucket}.${doRegion}.digitaloceanspaces.com/${key}`;
    }
}
