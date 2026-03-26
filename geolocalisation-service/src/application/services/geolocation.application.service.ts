import { Injectable, Logger } from '@nestjs/common';
import { EventTag } from '@clement.pasteau/shared';
import { GeocodingService } from '../../infrastructure/geocoding/geocoding.service.js';
import { GeolocalisationRepository } from '../../infrastructure/database/geolocalisation.repository.js';
import { Coordinate, GeocodingProviderType } from '../../domain/geocoding/geocoding.provider.js';
import { NearbyTransaction } from '../../domain/geocoding/geolocalisation.interface.js';
import { MapZoneModel } from '../../infrastructure/database/models/map-zone.model.js';

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
    provider: GeocodingProviderType = GeocodingProviderType.OPEN_STREET_MAP,
    tag: EventTag,
  ): Promise<{ coordinate: Coordinate; zone: MapZoneModel } | null> {
    const coordinate: Coordinate | null = await this.geocodingService.geocode(address, provider);
    if (!coordinate) {
      this.logger.warn(`Could not geocode address: ${address}`);
      return null;
    }

    await this.geolocalisationRepository.addTransaction(transactionId, coordinate, amount, tag);

    const zone = await this.geolocalisationRepository.upsertZone(
      coordinate.latitude,
      coordinate.longitude,
      tag,
    );

    this.logger.log(
      `Tracked transaction ${transactionId} at ${coordinate.latitude}, ${coordinate.longitude} (Zone ${zone.id}, weight ${zone.weight})`,
    );

    return { coordinate, zone };
  }

  async getNearbyTransactions(
    latitude: number,
    longitude: number,
    radiusKm: number,
    tag?: EventTag,
  ): Promise<NearbyTransaction[]> {
    return this.geolocalisationRepository.findNearbyTransactions(
      latitude,
      longitude,
      radiusKm,
      tag,
    );
  }

  async getZones(tag?: EventTag): Promise<MapZoneModel[]> {
    return this.geolocalisationRepository.getAllZones(tag);
  }
}
