import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './infrastructure/redis/redis.module.js';
import { FileService } from './application/services/file.service.js';
import { FileCommandController } from './application/controllers/file.command.controller.js';
import { FileQueryController } from './application/controllers/file.query.controller.js';
import { FILE_REPOSITORY } from './domain/ports/file.repository.js';
import { FileRepositoryImpl } from './infrastructure/persistence/file.repository.impl.js';
import { FileModel } from './infrastructure/models/file.model.js';
import {
  DATABASE_DEV_CONF,
  DATABASE_PROD_CONFIG,
} from './config/database.config.js';

const isRuntimeEnvConfig =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      isRuntimeEnvConfig ? DATABASE_PROD_CONFIG : DATABASE_DEV_CONF,
    ),
    TypeOrmModule.forFeature([FileModel]),
    RedisModule,
  ],
  controllers: [FileCommandController, FileQueryController],
  providers: [
    FileService,
    {
      provide: FILE_REPOSITORY,
      useClass: FileRepositoryImpl,
    },
  ],
})
export class AppModule {}
