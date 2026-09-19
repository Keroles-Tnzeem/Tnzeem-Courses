import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tnzeem',
    ssl:
        process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
    // Schema auto-sync is opt-in: on by default only for NODE_ENV=development.
    // TYPEORM_SYNC=true/false overrides. Staging/production use migrations.
    synchronize:
        process.env.TYPEORM_SYNC !== undefined
            ? process.env.TYPEORM_SYNC === 'true'
            : process.env.NODE_ENV === 'development',
    entities: [path.join(__dirname, '../**/*.entity.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
    migrationsTableName: 'typeorm_migrations',
});
