import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface.js';
import { RedisChannel } from '../../domain/events/redis-channels.enum.js';
import { BroadcastHandler } from './broadcast.handler.js';
import { NotificationHandler } from './notification.handler.js';
import { UserEventsHandler } from './user-events.handler.js';
import { FileEventsHandler } from './file-events.handler.js';
import { GeolocationUpdatesHandler } from './geolocation-updates.handler.js';

@Injectable()
export class HandlerRegistry {
  private readonly logger = new Logger(HandlerRegistry.name);
  private readonly handlers = new Map<string, IEventHandler>();

  constructor(
    broadcastHandler: BroadcastHandler,
    notificationHandler: NotificationHandler,
    userEventsHandler: UserEventsHandler,
    fileEventsHandler: FileEventsHandler,
    geolocationUpdatesHandler: GeolocationUpdatesHandler,
  ) {
    this.handlers.set(RedisChannel.BROADCAST, broadcastHandler);
    this.handlers.set(RedisChannel.NOTIFICATION, notificationHandler);
    this.handlers.set(RedisChannel.USER_EVENTS, userEventsHandler);
    this.handlers.set(RedisChannel.FILE_EVENTS, fileEventsHandler);
    this.handlers.set(
      RedisChannel.GEOLOCATION_UPDATES,
      geolocationUpdatesHandler,
    );
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
