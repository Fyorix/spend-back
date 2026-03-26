import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_SUBSCRIBER } from './redis.constants.js';
import { HandlerRegistry } from '../../application/handlers/handler.registry.js';
import { RedisChannel } from '../../domain/events/redis-channels.enum.js';

@Injectable()
export class RedisSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSubService.name);

  constructor(
    @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis,
    private readonly handlerRegistry: HandlerRegistry,
  ) { }

  async onModuleInit(): Promise<void> {
    const channels = Object.values(RedisChannel);
    await this.subscriber.subscribe(...channels);
    this.logger.log(`Subscribed to channels: [${channels.join(', ')}]`);

    this.subscriber.on('message', (channel: string, message: string) => {
      this.logger.debug(`Received on [${channel}]: ${message}`);
      try {
        const parsed: unknown = JSON.parse(message);
        this.handlerRegistry.dispatch(channel, parsed);
      } catch (error) {
        this.logger.error(`Failed to process message on [${channel}]`, error);
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber.unsubscribe();
    await this.subscriber.quit();
    this.logger.log('Redis subscriber disconnected');
  }
}
