import {
  Coordinate,
  GeocodingProviderType,
} from '../../../domain/geocoding/geocoding.provider.js';
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
}

interface GoogleMapsAutocompleteResponse {
  predictions: { description: string }[];
}

export class GoogleMapsProvider extends BaseGeocodingProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async geocode(address: string): Promise<Coordinate | null> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
    const data = await this.request<GoogleMapsGeocodeResponse>(url);
    if (data && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }
    return null;
  }

  async autocomplete(query: string): Promise<string[]> {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${this.apiKey}`;
    const data = await this.request<GoogleMapsAutocompleteResponse>(url);
    return data?.predictions.map((p) => p.description) || [];
  }

  getName(): GeocodingProviderType {
    return GeocodingProviderType.GOOGLE_MAPS;
  }
}
