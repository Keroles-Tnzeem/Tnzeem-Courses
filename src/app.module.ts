import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from 'nestjs-i18n';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import i18nConfig from './config/i18n.config';
import * as path from 'path';
import { AuthModule } from './shared/auth/auth.module';
import { UserModule } from './shared/user/user.module';
import { StaffModule } from './staff-dashboard/staff/staff.module';
import { PermissionsModule } from './staff-dashboard/permissions/permissions.module';
import { TrainerModule } from './staff-dashboard/trainer/trainer.module';
import { StudentModule } from './staff-dashboard/student/student.module';
import { CourseCategoriesModule } from './staff-dashboard/course-categories/course-categories.module';
import { StorageModule } from './shared/storage/storage.module';
import { CoursesModule } from './staff-dashboard/courses/courses.module';
import { SourcesModule } from './staff-dashboard/sources/sources.module';
import { RoundsModule } from './staff-dashboard/rounds/rounds.module';
import { RoundSessionsModule } from './staff-dashboard/round-sessions/round-sessions.module';
import { OrdersModule } from './shared/orders/orders.module';
import { PaymentModule } from './shared/payment/payment.module';
import { StaffOrdersModule } from './staff-dashboard/orders/orders.module';
import { GuestCourseCategoriesModule } from './website/shared/course-categories/course-categories.module';
import { GuestCourseRoundsModule } from './website/shared/course-rounds/course-rounds.module';
import { GuestCoursesModule } from './website/shared/courses/courses.module';
import { MenuModule } from './staff-dashboard/menu/menu.module';
import { ContactUsModule } from "./website/guest/countact-us/contact-us.module";
import { WebsiteMenuModule } from "./website/shared/menu/menu.module";
import { EnrollmentsModule } from './shared/enrollments/enrollments.module';
import { CertificatesModule } from './website/shared/certificates/certificates.module';
import { StaffEnrollmentsModule } from './staff-dashboard/enrollments/enrollments.module';
import { OrderCommentsModule } from './staff-dashboard/order-comments/order-comments.module';

const i18nPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'i18n')
  : path.join(process.cwd(), 'src', 'i18n');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, i18nConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database')!,
    }),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('i18n.fallbackLanguage') || 'en',
        loaderOptions: {
          path: i18nPath,
          watch: process.env.NODE_ENV !== 'production',
        },
      }),
      resolvers: [
        { use: HeaderResolver, options: ['x-lang'] },
        AcceptLanguageResolver,
      ],
    }),
    AuthModule,
    UserModule,
    StaffModule,
    PermissionsModule,
    TrainerModule,
    StudentModule,
    CourseCategoriesModule,
    StorageModule,
    CoursesModule,
    SourcesModule,
    RoundsModule,
    RoundSessionsModule,
    OrdersModule,
    PaymentModule,
    StaffOrdersModule,
    GuestCourseCategoriesModule,
    GuestCourseRoundsModule,
    GuestCoursesModule,
    MenuModule,
    ContactUsModule,
    WebsiteMenuModule,
    EnrollmentsModule,
    StaffEnrollmentsModule,
    CertificatesModule,
    OrderCommentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
