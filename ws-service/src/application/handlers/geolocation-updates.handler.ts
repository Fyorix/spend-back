import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface.js';
import { WsEmitterService } from '../../gateway/ws-emitter.service.js';
import { RedisEvent } from '../../domain/events/redis-event.interface.js';
import { RedisPubService } from '../../infrastructure/redis/redis-pub.service.js';

@Injectable()
export class GeolocationUpdatesHandler implements IEventHandler {
  private readonly logger = new Logger(GeolocationUpdatesHandler.name);

  constructor(
    private readonly wsEmitter: WsEmitterService,
    private readonly redisPub: RedisPubService,
  ) {}

  handle(data: unknown): void {
    const event = data as RedisEvent;
    if (!event.event || event.payload === undefined) {
      this.logger.warn('Invalid geolocation update event received');
      return;
    }

    this.logger.debug(`Geolocation update event [${event.event}]`);

    if (event.event === 'ping_from_geoloc') {
      this.logger.log(
        'Received PING from geolocalisation-service, sending PONG',
      );
      this.redisPub
        .publish('geolocation_pong', {
          event: 'pong_to_geoloc',
          payload: {
            message: 'PONG from ws-service!',
            receivedAt: new Date().toISOString(),
          },
        })
        .catch((err) => this.logger.error('Failed to send PONG', err));
    }

    if (event.event === 'ping-2') {
      const roomPayload = event.payload as {
        room: string;
        message: string;
        sender: string;
      };
      this.logger.log(`Dispatching ping-2 to room: ${roomPayload.room}`);
      this.wsEmitter.emitToRoom(roomPayload.room, 'ping_room', {
        message: roomPayload.message,
        sender: roomPayload.sender,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.wsEmitter.broadcast(event.event, event.payload);
  }
}
