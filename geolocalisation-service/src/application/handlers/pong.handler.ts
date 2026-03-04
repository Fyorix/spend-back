import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface.js';
import { RedisEvent } from '../../domain/events/redis-event.interface.js';

@Injectable()
export class PongHandler implements IEventHandler {
  private readonly logger = new Logger(PongHandler.name);

  handle(data: unknown): void {
    const event = data as RedisEvent;
    this.logger.log(
      `Received PONG from WebSocket service with message: ${JSON.stringify(event.payload)}`,
    );
  }
}
