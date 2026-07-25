import { NestFactory } from '@nestjs/core';
import * as express from 'express';

import { AppModule } from './app.module';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Additional parsers for urlencoded bodies
  app.use(express.urlencoded({ extended: true }));

  // i18n-aware validation: translates messages based on request language header
  app.useGlobalPipes(new I18nValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: false }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
