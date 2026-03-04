import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RedisPubService } from './infrastructure/redis/redis-pub.service';
import { RedisSubService } from './infrastructure/redis/redis-sub.service';
import { HandlerRegistry } from './application/handlers/handler.registry';
import { NotificationHandler } from './application/handlers/notification.handler';
import { GeolocationUpdatesHandler } from './application/handlers/geolocation-updates.handler';

@Module({
  imports: [RedisModule],
  controllers: [AppController],
  providers: [
    AppService,
    RedisPubService,
    RedisSubService,
    HandlerRegistry,
    NotificationHandler,
    GeolocationUpdatesHandler,
  ],
})
export class AppModule {}
