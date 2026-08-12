import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { BannersModule } from './banners/banners.module';
import { TopicsModule } from './topics/topics.module';
import { USPsModule } from './usps/usps.module';
import { ProgramsModule } from './programs/programs.module';
import { EventsModule } from './events/events.module';
import { VideoCoursesModule } from './video-courses/video-courses.module';
import { CommunitiesModule } from './communities/communities.module';
import { FAQsModule } from './faqs/faqs.module';
import { PagesModule } from './pages/pages.module';
import { NavigationModule } from './navigation/navigation.module';
import { FooterModule } from './footer/footer.module';
import { SeederService } from './database/seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DATABASE_HOST || '194.233.91.132',
        port: parseInt(process.env.DATABASE_PORT || '35432', 10),
        username: process.env.DATABASE_USER || 'jaribakat2',
        password: process.env.DATABASE_PASS || 'jaribakat123',
        database: process.env.DATABASE_NAME || 'jaribakat2',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    UploadModule,
    SiteSettingsModule,
    BannersModule,
    TopicsModule,
    USPsModule,
    ProgramsModule,
    EventsModule,
    VideoCoursesModule,
    CommunitiesModule,
    FAQsModule,
    PagesModule,
    NavigationModule,
    FooterModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
