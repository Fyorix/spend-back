import { Logger } from '@nestjs/common';
import {
  Coordinate,
  GeocodingProviderType,
} from '../../../domain/geocoding/geocoding.provider.js';
import { BaseGeocodingProvider } from '../../../domain/geocoding/base-geocoding.provider.js';

interface OsmResponse {
  lat: string;
  lon: string;
}

interface OsmAutocompleteResponse {
  display_name: string;
}

export class OpenStreetMapProvider extends BaseGeocodingProvider {
  private static queue: Promise<void> = Promise.resolve();
  private readonly logger = new Logger(OpenStreetMapProvider.name);

  constructor() {
    super();
  }

  private async wait(): Promise<void> {
    const currentQueue = OpenStreetMapProvider.queue;
    OpenStreetMapProvider.queue = (async () => {
      try {
        await currentQueue;
      } catch {
        this.logger.error('Failed to wait for OpenStreetMap provider');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    })();
    await currentQueue;
  }

  async geocode(address: string): Promise<Coordinate | null> {
    await this.wait();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const data = await this.request<OsmResponse[]>(url, {
      headers: { 'User-Agent': 'SpendApp/1.0' },
    });

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  }

  async autocomplete(query: string): Promise<string[]> {
    await this.wait();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
    const data = await this.request<OsmAutocompleteResponse[]>(url, {
      headers: { 'User-Agent': 'SpendApp/1.0' },
    });

    if (data) {
      return data.map((item) => item.display_name);
    }

    this.logger.error(
      'Autocomplete request failed or returned invalid data for OpenStreetMap',
    );
    return [];
  }

  getName(): GeocodingProviderType {
    return GeocodingProviderType.OPEN_STREET_MAP;
  }
}
