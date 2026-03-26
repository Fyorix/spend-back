import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface.js';
import { WsEmitterService } from '../../gateway/ws-emitter.service.js';
import {
  MapEventType,
  type ZoneUpdatedEvent,
  type TransactionPingedEvent,
} from '@clement.pasteau/shared';

@Injectable()
export class GeolocationUpdatesHandler implements IEventHandler {
  private readonly logger = new Logger(GeolocationUpdatesHandler.name);

  constructor(private readonly wsEmitter: WsEmitterService) { }

  handle(data: unknown): void {
    const event = data as { type: any; payload: any };

    if (!event.type || !event.payload) {
      this.logger.warn('Invalid geolocation update event received');
      return;
    }

    this.logger.debug(`Received Map Event: ${event.type}`);

    if (event.type === MapEventType.ZONE_UPDATED) {
      const zoneEvent = event as ZoneUpdatedEvent;
      this.wsEmitter.emitZoneUpdate(zoneEvent.payload);
      this.logger.log(
        `Broadcasted Zone Update: ${zoneEvent.payload.id} (Weight: ${zoneEvent.payload.weight})`,
      );
    }

    if (event.type === MapEventType.TRANSACTION_PINGED) {
      const pingEvent = event as TransactionPingedEvent;
      this.wsEmitter.emitTransactionPing(
        pingEvent.payload.userId,
        pingEvent.payload,
      );
      this.logger.log(
        `Emitted Private Ping to User: ${pingEvent.payload.userId}`,
      );
    }
  }
}
