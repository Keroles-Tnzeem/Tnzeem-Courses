import { DataSource } from 'typeorm';
import { seedAdminUserAndPermissions } from './admin-user.seed';
import * as dotenv from 'dotenv';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { PermissionEntity } from '../../shared/user/entities/permission.entity';
import { UserPermissionEntity } from '../../shared/user/entities/user-permission.entity';
import { TrainerInfoEntity } from '../../shared/user/entities/trainer-info.entity';
import { SourceEntity } from '../../staff-dashboard/sources/entities/source.entity';


dotenv.config();

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tnzeem',
    entities: [UserEntity, PermissionEntity, UserPermissionEntity, TrainerInfoEntity, SourceEntity],

    ssl: {
        rejectUnauthorized: false,
    },

    synchronize: true,
});

AppDataSource.initialize()
    .then(async () => {
        console.log('Database connected!');
        await seedAdminUserAndPermissions(AppDataSource);
        console.log('Finished seeding!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during data source initialization', error);
        process.exit(1);
    });
