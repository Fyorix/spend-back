import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { GeolocationApplicationService } from '../../application/services/geolocation.application.service.js';
import { GeocodingProviderType } from '../../domain/geocoding/geocoding.provider.js';
import {
  AccountEventAccountType,
  type TransactionCreatedEvent,
} from '@clement.pasteau/shared';

@Injectable()
export class RedisSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSubService.name);
  private readonly ACCOUNT_EVENTS_CHANNEL = 'account_events';

  constructor(
    @Inject('REDIS_SUBSCRIBER') private readonly subscriber: Redis,
    private readonly geolocationService: GeolocationApplicationService,
  ) { }

  async onModuleInit(): Promise<void> {
    await this.subscriber.subscribe(this.ACCOUNT_EVENTS_CHANNEL);
    this.logger.log(`Subscribed to channel: ${this.ACCOUNT_EVENTS_CHANNEL}`);

    this.subscriber.on('message', (channel: string, message: string) => {
      if (channel === this.ACCOUNT_EVENTS_CHANNEL) {
        void this.handleAccountEvent(message);
      }
    });
  }

  private async handleAccountEvent(message: string): Promise<void> {
    try {
      const event = JSON.parse(message) as { type: string; payload: unknown };
      if (event.type === AccountEventAccountType.TRANSACTION_CREATED) {
        const transactionEvent = event as TransactionCreatedEvent;
        const { payload } = transactionEvent;

        this.logger.log(
          `Processing TRANSACTION_CREATED for ${payload.transactionId}`,
        );

        await this.geolocationService.trackTransaction(
          payload.transactionId,
          payload.address,
          payload.amount,
          GeocodingProviderType.OPEN_STREET_MAP,
          payload.tag,
        );
      }
    } catch (error) {
      this.logger.error('Failed to process account event', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber.unsubscribe();
    this.logger.log('Redis subscriber disconnected');
  }
}
