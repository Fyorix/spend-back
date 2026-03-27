import { Logger } from '@nestjs/common';
import { Coordinate, GeocodingProvider, GeocodingProviderType } from './geocoding.provider.js';

export abstract class BaseGeocodingProvider implements GeocodingProvider {
  protected async request<T>(url: string, options?: RequestInit): Promise<T | null> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        Logger.error(`[BaseGeocodingProvider] Request failed for ${url}: ${response.status} ${response.statusText}`, 'BaseGeocodingProvider');
        return null;
      }
      return (await response.json()) as T;
    } catch (e) {
      Logger.error(`[BaseGeocodingProvider] Fetch error for ${url}: ${e}`, 'BaseGeocodingProvider');
      return null;
    }
  }

  abstract geocode(address: string): Promise<Coordinate | null>;
  abstract getName(): GeocodingProviderType;
}
