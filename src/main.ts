import { NestFactory } from '@nestjs/core';
import * as express from 'express';

import { AppModule } from './app.module';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MultipartJsonPipe } from './common/pipes/multipart-json.pipe';

async function bootstrap() {
   console.log('Starting Nest application...');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // Behind a reverse proxy (nginx/DO) rate limiting needs the real client IP.
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }
  const allowedOrigins: string[] = configService.get<string[]>('app.cors.allowedOrigins') ?? [];

  // CORS — origins are driven by CORS_ALLOWED_ORIGINS in .env
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Reject cleanly (no CORS headers) instead of throwing, which surfaced as a 500.
        callback(null, false);
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'Accept-Language',
      'X-Lang',
      'Idempotency-Key',
    ],
    credentials: true,
  });

  // Serve static assets
  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/public/' });

  // Additional parsers for urlencoded bodies
  app.use(express.urlencoded({ extended: true }));

  // i18n-aware validation: translates messages based on request language header
  app.useGlobalPipes(
    new MultipartJsonPipe(),
    new I18nValidationPipe({ 
      whitelist: true, 
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    })
  );
  app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: false }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tnzeem Courses API')
    .setDescription('API documentation for the Tnzeem Courses platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port') ?? process.env.PORT ?? 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`Listening on ${port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ') || '(none)'}`);
}
bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});
