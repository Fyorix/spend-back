import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_PUBLISHER } from './redis.constants.js';

@Injectable()
export class RedisPubService {
  private readonly logger = new Logger(RedisPubService.name);

  constructor(@Inject(REDIS_PUBLISHER) private readonly publisher: Redis) {}

  async publish(channel: string, payload: unknown): Promise<void> {
    try {
      const message = JSON.stringify(payload);
      await this.publisher.publish(channel, message);
      this.logger.debug(`Published to channel [${channel}]: ${message}`);
    } catch (error) {
      this.logger.error(`Failed to publish to channel [${channel}]`, error);
    }
  }
}
