import { Injectable, Logger } from '@nestjs/common';
import { GeocodingService } from '../../infrastructure/geocoding/geocoding.service.js';
import { GeolocalisationRepository } from '../../infrastructure/database/geolocalisation.repository.js';
import {
  Coordinate,
  GeocodingProviderType,
} from '../../domain/geocoding/geocoding.provider.js';
import { NearbyTransaction } from '../../domain/geocoding/geolocalisation.interface.js';

@Injectable()
export class GeolocationApplicationService {
  private readonly logger = new Logger(GeolocationApplicationService.name);

  constructor(
    private readonly geocodingService: GeocodingService,
    private readonly geolocalisationRepository: GeolocalisationRepository,
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

    await this.geolocalisationRepository.addTransaction(
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
  ): Promise<NearbyTransaction[]> {
    return this.geolocalisationRepository.findNearbyTransactions(
      latitude,
      longitude,
      radiusKm,
    );
  }
}
