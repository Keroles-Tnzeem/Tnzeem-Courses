import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    port: parseInt(process.env.APP_PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'Tnzeem Courses',
    url: process.env.APP_URL || 'http://localhost:3000',
    cors: {
        allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || '')
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean),
    },
}));
