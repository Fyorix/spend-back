import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EventTestController } from './application/event-test.controller.js';
import { AppService } from './app.service';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RedisPubService } from './infrastructure/redis/redis-pub.service';
import { RedisSubService } from './infrastructure/redis/redis-sub.service';
import { HandlerRegistry } from './application/handlers/handler.registry';
import { NotificationHandler } from './application/handlers/notification.handler';
import { GeolocationUpdatesHandler } from './application/handlers/geolocation-updates.handler';
import { PongHandler } from './application/handlers/pong.handler';

@Module({
  imports: [RedisModule],
  controllers: [AppController, EventTestController],
  providers: [
    AppService,
    RedisPubService,
    RedisSubService,
    HandlerRegistry,
    NotificationHandler,
    GeolocationUpdatesHandler,
    PongHandler,
  ],
})
export class AppModule {}
