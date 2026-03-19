import { Injectable, Logger } from '@nestjs/common';
import { GeocodingService } from '../../infrastructure/geocoding/geocoding.service.js';
import { RedisGeolocationRepository } from '../../infrastructure/redis/redis.repository.js';
import {
  Coordinate,
  GeocodingProviderType,
} from '../../domain/geocoding/geocoding.provider.js';

@Injectable()
export class GeolocationApplicationService {
  private readonly logger = new Logger(GeolocationApplicationService.name);

  constructor(
    private readonly geocodingService: GeocodingService,
    private readonly redisRepository: RedisGeolocationRepository,
  ) {}

  async trackTransaction(
    transactionId: string,
    address: string,
    amount: number,
    provider?: GeocodingProviderType,
  ): Promise<Coordinate | null> {
    const coordinate = await this.geocodingService.geocode(address, provider);
    if (!coordinate) {
      this.logger.warn(`Could not geocode address: ${address}`);
      return null;
    }

    await this.redisRepository.addTransaction(
      transactionId,
      coordinate,
      amount,
    );
    this.logger.log(
      `Tracked transaction ${transactionId} at ${coordinate.latitude}, ${coordinate.longitude}`,
    );
    return coordinate;
  }

  async getNearbyTransactions(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ) {
    return this.redisRepository.findNearbyTransactions(
      latitude,
      longitude,
      radiusKm,
    );
  }

  async autocomplete(
    query: string,
    provider?: GeocodingProviderType,
  ): Promise<string[]> {
    return this.geocodingService.autocomplete(query, provider);
  }
}
