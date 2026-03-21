import { GeocodingService } from '../../../infrastructure/geocoding/geocoding.service.js';
import { GoogleMapsProvider } from '../../../infrastructure/geocoding/strategies/google-maps.provider.js';
import { OpenStreetMapProvider } from '../../../infrastructure/geocoding/strategies/osm.provider.js';
import {
  GeocodingProvider,
  GeocodingProviderType,
} from '../../../domain/geocoding/geocoding.provider.js';
import { jest } from '@jest/globals';
import { createCoordinate } from '../../helpers/factories.js';

describe('GeocodingService (Unit)', () => {
  let service: GeocodingService;
  let googleProvider: GoogleMapsProvider;
  let osmProvider: OpenStreetMapProvider;

  beforeEach(() => {
    service = new GeocodingService();
    const internal = service as unknown as {
      providers: Record<string, GeocodingProvider>;
    };
    googleProvider = internal.providers[
      GeocodingProviderType.GOOGLE_MAPS
    ] as GoogleMapsProvider;
    osmProvider = internal.providers[
      GeocodingProviderType.OPEN_STREET_MAP
    ] as OpenStreetMapProvider;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return coordinates from Google Maps when specified', async () => {
    const address = 'Paris';
    const coordinate = createCoordinate();
    const googleSpy = jest
      .spyOn(googleProvider, 'geocode')
      .mockResolvedValue(coordinate);

    const result = await service.geocode(
      address,
      GeocodingProviderType.GOOGLE_MAPS,
    );

    expect(result).toEqual(coordinate);
    expect(googleSpy).toHaveBeenCalledWith(address);
  });

  it('should return coordinates from OpenStreetMap when specified', async () => {
    const address = 'Paris';
    const coordinate = createCoordinate();
    const osmSpy = jest
      .spyOn(osmProvider, 'geocode')
      .mockResolvedValue(coordinate);

    const result = await service.geocode(
      address,
      GeocodingProviderType.OPEN_STREET_MAP,
    );

    expect(result).toEqual(coordinate);
    expect(osmSpy).toHaveBeenCalledWith(address);
  });

  it('should return null if the provider fails', async () => {
    const address = 'Unknown';
    const googleSpy = jest
      .spyOn(googleProvider, 'geocode')
      .mockResolvedValue(null);

    const result = await service.geocode(
      address,
      GeocodingProviderType.GOOGLE_MAPS,
    );

    expect(result).toBeNull();
    expect(googleSpy).toHaveBeenCalledWith(address);
  });

  it('should catch errors from providers and return null', async () => {
    const address = 'Error';
    jest
      .spyOn(googleProvider, 'geocode')
      .mockRejectedValue(new Error('API Down'));

    const result = await service.geocode(
      address,
      GeocodingProviderType.GOOGLE_MAPS,
    );

    expect(result).toBeNull();
  });
});
