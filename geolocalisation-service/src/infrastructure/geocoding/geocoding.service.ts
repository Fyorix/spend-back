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
  private readonly providers: Record<GeocodingProviderType, GeocodingProvider>;
  private readonly logger = new Logger(GeocodingService.name);

  constructor() {
    const config = loadEnvConfig();
    this.providers = {
      [GeocodingProviderType.GOOGLE_MAPS]: new GoogleMapsProvider(
        config.googleMapsApiKey,
      ),
      [GeocodingProviderType.OPEN_STREET_MAP]: new OpenStreetMapProvider(),
    };
  }

  async geocode(
    address: string,
    providerName: GeocodingProviderType,
  ): Promise<Coordinate | null> {
    const provider = this.providers[providerName];
    if (!provider) return null;

    try {
      const result = await provider.geocode(address);
      if (result) {
        this.logger.log(`Successfully geocoded using ${provider.getName()}`);
        return result;
      }
    } catch (error) {
      this.logger.error(`Geocoding failed for ${providerName}`, error);
    }
    return null;
  }
}
