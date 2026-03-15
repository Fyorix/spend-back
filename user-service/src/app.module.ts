import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  DATABASE_DEV_CONF,
  DATABASE_PROD_CONFIG,
} from './config/database.config';
import { UserModule } from './module/user.module';

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
