import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_PUBLISHER } from './redis.constants.js';

@Injectable()
export class RedisPubService {
  private readonly logger = new Logger(RedisPubService.name);

  constructor(@Inject(REDIS_PUBLISHER) private readonly publisher: Redis) {}

  async publish(channel: string, data: unknown): Promise<number> {
    const message = JSON.stringify(data);
    this.logger.debug(`Publishing to [${channel}]: ${message}`);
    return this.publisher.publish(channel, message);
  }
}
