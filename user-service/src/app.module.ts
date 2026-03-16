import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import {
  DATABASE_DEV_CONF,
  DATABASE_PROD_CONFIG,
} from './config/database.config.js';
import { UserModule } from './module/user.module.js';

const isRuntimeEnvConfig =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      isRuntimeEnvConfig ? DATABASE_PROD_CONFIG : DATABASE_DEV_CONF,
    ),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
