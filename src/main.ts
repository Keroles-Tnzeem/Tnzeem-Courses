import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import multer = require('multer');
import { AppModule } from './app.module';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
  // Disable built-in body parser so we control the order
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Register parsers manually — order matters
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // handles application/x-www-form-urlencoded
  app.use(multer().none());                        // handles multipart/form-data (Postman "form-data" tab)

  // i18n-aware validation: translates messages based on request language header
  app.useGlobalPipes(new I18nValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: false }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
