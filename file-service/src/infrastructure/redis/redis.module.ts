import { Module, Global } from '@nestjs/common';
import { REDIS_PUBLISHER, REDIS_SUBSCRIBER } from './redis.constants.js';
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
    {
      provide: REDIS_SUBSCRIBER,
      useFactory: () => {
        const config = loadEnvConfig();
        return new Redis({ host: config.redisHost, port: config.redisPort });
      },
    },
    RedisPubService,
  ],
  exports: [REDIS_PUBLISHER, REDIS_SUBSCRIBER, RedisPubService],
})
export class RedisModule {}
