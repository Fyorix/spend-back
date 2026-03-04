import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface.js';
import { RedisEvent } from '../../domain/events/redis-event.interface.js';

@Injectable()
export class GeolocationUpdatesHandler implements IEventHandler {
  private readonly logger = new Logger(GeolocationUpdatesHandler.name);

  handle(data: unknown): void {
    const event = data as RedisEvent;
    if (!event.event || event.payload === undefined) {
      this.logger.warn('Invalid geolocation update event received');
      return;
    }
    this.logger.log(`Geolocation update [${event.event}]`);
  }
}
