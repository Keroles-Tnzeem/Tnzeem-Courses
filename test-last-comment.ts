import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { OrdersService } from './src/staff-dashboard/orders/orders.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ordersService = app.get(OrdersService);
  const order = await ordersService.findOne('01KZK5B2VCVBNDK9FXX5FP2W9Q', 'en');
  console.log('Order retrieved:', order.lastComment);
  await app.close();
}
bootstrap();
