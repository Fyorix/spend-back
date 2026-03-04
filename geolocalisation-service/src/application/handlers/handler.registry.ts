import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface.js';
import { RedisChannel } from '../../domain/events/redis-channels.enum.js';
import { NotificationHandler } from './notification.handler.js';
import { GeolocationUpdatesHandler } from './geolocation-updates.handler.js';
import { PongHandler } from './pong.handler.js';

@Injectable()
export class HandlerRegistry {
  private readonly logger = new Logger(HandlerRegistry.name);
  private readonly handlers = new Map<string, IEventHandler>();

  constructor(
    notificationHandler: NotificationHandler,
    geolocationUpdatesHandler: GeolocationUpdatesHandler,
    pongHandler: PongHandler,
  ) {
    this.handlers.set(RedisChannel.NOTIFICATION, notificationHandler);
    this.handlers.set(
      RedisChannel.GEOLOCATION_UPDATES,
      geolocationUpdatesHandler,
    );
    this.handlers.set(RedisChannel.GEOLOCATION_PONG, pongHandler);
  }

  dispatch(channel: string, data: unknown): void {
    const handler = this.handlers.get(channel);
    if (!handler) {
      this.logger.warn(`No handler registered for channel [${channel}]`);
      return;
    }
    handler.handle(data);
  }
}
