import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface.js';
import { RedisEvent } from '../../domain/events/redis-event.interface.js';

@Injectable()
export class FileEventsHandler implements IEventHandler {
  private readonly logger = new Logger(FileEventsHandler.name);

  handle(data: unknown): void {
    const event = data as RedisEvent;
    if (!event.event || event.payload === undefined) {
      this.logger.warn('Invalid file event received');
      return;
    }
    this.logger.log(`File event [${event.event}]`);
  }
}
