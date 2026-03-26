import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { GeolocationApplicationService } from '../../application/services/geolocation.application.service.js';
import {
  AccountEventAccountType,
  MapEventType,
  type TransactionCreatedEvent,
  type ZoneUpdatedEvent,
  type TransactionPingedEvent,
} from '@clement.pasteau/shared';
import { Coordinate } from '../../domain/geocoding/geocoding.provider.js';
import { MapZoneModel } from '../database/models/map-zone.model.js';

@Injectable()
export class RedisSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSubService.name);

  private static readonly CHANNELS = {
    ACCOUNT_EVENTS: 'account_events',
    MAP_EVENTS: 'map_events',
  } as const;

  constructor(
    @Inject('REDIS_SUBSCRIBER') private readonly subscriber: Redis,
    @Inject('REDIS_PUBLISHER') private readonly publisher: Redis,
    private readonly geolocationService: GeolocationApplicationService,
  ) { }
  async onModuleInit(): Promise<void> {
    await this.subscriber.subscribe(RedisSubService.CHANNELS.ACCOUNT_EVENTS);
    this.logger.log(`Subscribed to channel: ${RedisSubService.CHANNELS.ACCOUNT_EVENTS}`);

    this.subscriber.on('message', (channel: string, message: string) => {
      this.route(channel, message).catch((err: unknown) =>
        this.logger.error(`Error handling message on channel [${channel}]`, err),
      );
    });
  }

  private async route(channel: string, message: string): Promise<void> {
    switch (channel) {
      case RedisSubService.CHANNELS.ACCOUNT_EVENTS:
        await this.handleAccountEvent(message);
        break;
      default:
        this.logger.warn(`Unmanaged channel: ${channel}`);
    }
  }

  private async handleAccountEvent(message: string): Promise<void> {
    const event = this.parseMessage<TransactionCreatedEvent>(message);
    if (!event) return;

    if (event.type === AccountEventAccountType.TRANSACTION_CREATED) {
      const { payload } = event;

      this.logger.log(`Processing TRANSACTION_CREATED for ${payload.transactionId}`);

      const result = await this.geolocationService.trackTransaction(
        payload.transactionId,
        payload.address,
        payload.amount,
        undefined,
        payload.tag,
      );

      if (result) {
        await this.publishGeoEvents(result, payload);
      }
    }
  }

  private async publishGeoEvents(
    result: { coordinate: Coordinate; zone: MapZoneModel },
    payload: TransactionCreatedEvent['payload'],
  ): Promise<void> {
    const { coordinate, zone } = result;

    const zoneEvent: ZoneUpdatedEvent = {
      type: MapEventType.ZONE_UPDATED,
      payload: {
        id: zone.id,
        latitude: zone.location.coordinates[1],
        longitude: zone.location.coordinates[0],
        weight: zone.weight,
        radius: zone.radius,
        tag: zone.tag,
      },
    };

    const pingEvent: TransactionPingedEvent = {
      type: MapEventType.TRANSACTION_PINGED,
      payload: {
        transactionId: payload.transactionId,
        userId: payload.userId,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        amount: payload.amount,
        tag: payload.tag,
      },
    };

    await Promise.all([
      this.publisher.publish(RedisSubService.CHANNELS.MAP_EVENTS, JSON.stringify(zoneEvent)),
      this.publisher.publish(RedisSubService.CHANNELS.MAP_EVENTS, JSON.stringify(pingEvent)),
    ]);
  }

  private parseMessage<T>(message: string): T | null {
    try {
      return JSON.parse(message) as T;
    } catch (error) {
      this.logger.error('Failed to parse Redis message', { message, error });
      return null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber.unsubscribe();
    this.logger.log('Redis subscriber disconnected');
  }
}
