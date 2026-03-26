import { Module, Global } from '@nestjs/common';
import { RedisModule } from './redis/redis.module.js';
import { RedisPubService } from './redis/redis-pub.service.js';

@Global()
@Module({
  imports: [
    RedisModule,
  ],
  providers: [RedisPubService],
  exports: [RedisPubService],
})
export class InfrastructureModule { }
