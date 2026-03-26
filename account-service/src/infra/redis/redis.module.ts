import { Module, Global } from '@nestjs/common';
import { REDIS_PUBLISHER } from './redis.constants.js';
import { loadEnvConfig } from '../../config/env.config.js';
import { Redis } from 'ioredis';
import { RedisPubService } from './redis-pub.service.js';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_PUBLISHER,
      useFactory: () => {
        const config = loadEnvConfig();
        return new Redis({ host: config.redisHost, port: config.redisPort });
      },
    },
    RedisPubService,
  ],
  exports: [REDIS_PUBLISHER, RedisPubService],
})
export class RedisModule {}
