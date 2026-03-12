import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  DATABASE_DEV_CONF,
  DATABASE_PROD_CONFIG,
} from './config/database.config';
import { UserModule } from './module/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? DATABASE_PROD_CONFIG
        : DATABASE_DEV_CONF,
    ),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
