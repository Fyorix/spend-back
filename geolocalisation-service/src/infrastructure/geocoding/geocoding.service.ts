import { Injectable, Logger } from '@nestjs/common';
import {
  Coordinate,
  GeocodingProvider,
  GeocodingProviderType,
} from '../../domain/geocoding/geocoding.provider.js';
import { OpenStreetMapProvider } from './strategies/osm.provider.js';
import { GoogleMapsProvider } from './strategies/google-maps.provider.js';
import { loadEnvConfig } from '../../config/env.config.js';

@Injectable()
export class GeocodingService {
  private readonly providers: GeocodingProvider[];
  private readonly logger = new Logger(GeocodingService.name);

  constructor() {
    const config = loadEnvConfig();
    this.providers = [
      new GoogleMapsProvider(config.googleMapsApiKey),
      new OpenStreetMapProvider(),
    ];
  }

  async geocode(
    address: string,
    providerName?: GeocodingProviderType,
  ): Promise<Coordinate | null> {
    const effectiveProviders = providerName
      ? this.providers.filter((p) => p.getName() === providerName)
      : this.providers;

    for (const provider of effectiveProviders) {
      try {
        const result = await provider.geocode(address);
        if (result) {
          this.logger.log(`Successfully geocoded using ${provider.getName()}`);
          return result;
        }
      } catch {
        this.logger.error(`Geocoding failed for ${provider.getName()}`);
      }
    }
    this.logger.error('No geocoding provider could resolve the address.');
    return null;
  }
}
