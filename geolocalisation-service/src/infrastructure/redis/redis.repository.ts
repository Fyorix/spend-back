import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Coordinate } from '../../domain/geocoding/geocoding.provider.js';

@Injectable()
export class RedisGeolocationRepository
  implements OnModuleInit, OnModuleDestroy
{
  private redis: Redis;
  private readonly GEO_KEY = 'transactions:geo';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  async onModuleInit() {
    try {
      await this.redis.ping();
    } catch (error) {
      console.error('Redis connection failed', error);
    }
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async addTransaction(
    transactionId: string,
    coordinate: Coordinate,
    amount: number,
  ): Promise<void> {
    await this.redis.geoadd(
      this.GEO_KEY,
      coordinate.longitude,
      coordinate.latitude,
      transactionId,
    );
    await this.redis.set(
      `transaction:${transactionId}:amount`,
      amount.toString(),
    );
  }

  async findNearbyTransactions(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<
    {
      transactionId: string;
      latitude: number;
      longitude: number;
      amount: number;
    }[]
  > {
    const results = (await this.redis.georadius(
      this.GEO_KEY,
      longitude,
      latitude,
      radiusKm,
      'km',
      'WITHCOORD',
    )) as [string, [string, string]][];

    if (!Array.isArray(results)) return [];

    const transactions = await Promise.all(
      results.map(async (res) => {
        const [transactionId, [lng, lat]] = res;
        const amountStr = await this.redis.get(
          `transaction:${transactionId}:amount`,
        );
        return {
          transactionId,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          amount: parseFloat(amountStr || '0'),
        };
      }),
    );

    return transactions;
  }
}
