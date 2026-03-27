import { Logger } from '@nestjs/common';
import { Coordinate, GeocodingProviderType } from '../../../domain/geocoding/geocoding.provider.js';
import { BaseGeocodingProvider } from '../../../domain/geocoding/base-geocoding.provider.js';

interface GoogleMapsGeocodeResponse {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
  status: string;
}

export class GoogleMapsProvider extends BaseGeocodingProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async geocode(address: string): Promise<Coordinate | null> {
    if (!this.apiKey) {
      return null;
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
    const data = await this.request<GoogleMapsGeocodeResponse>(url);
    if (data && data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }
    if (data) {
      Logger.warn(`[GoogleMapsProvider] Geocoding returned status: ${data.status} for address: ${address}`, 'GoogleMapsProvider');
    }
    return null;
  }

  getName(): GeocodingProviderType {
    return GeocodingProviderType.GOOGLE_MAPS;
  }
}
