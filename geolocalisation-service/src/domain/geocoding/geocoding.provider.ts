export interface Coordinate {
  latitude: number;
  longitude: number;
}

export enum GeocodingProviderType {
  GOOGLE_MAPS = 'GoogleMaps',
  OPEN_STREET_MAP = 'OpenStreetMap',
}

export interface GeocodingProvider {
  geocode(address: string): Promise<Coordinate | null>;
  autocomplete(query: string): Promise<string[]>;
  getName(): GeocodingProviderType;
}
