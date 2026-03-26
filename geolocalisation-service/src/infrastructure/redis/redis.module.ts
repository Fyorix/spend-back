import { Module, Global } from '@nestjs/common';
import { Redis } from 'ioredis';
import { loadEnvConfig } from '../../config/env.config.js';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: () => {
        const config = loadEnvConfig();
        return new Redis({ host: config.redisHost, port: config.redisPort });
      },
    },
  ],
  exports: ['REDIS_SUBSCRIBER'],
})
export class RedisModule { }
