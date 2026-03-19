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
    const internal = service as unknown as { providers: GeocodingProvider[] };
    googleProvider = internal.providers[0] as GoogleMapsProvider;
    osmProvider = internal.providers[1] as OpenStreetMapProvider;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return coordinates from Google Maps if successful', async () => {
    const address = 'Paris';
    const coordinate = createCoordinate();
    const googleSpy = jest
      .spyOn(googleProvider, 'geocode')
      .mockResolvedValue(coordinate);

    const result = await service.geocode(address);

    expect(result).toEqual(coordinate);
    expect(googleSpy).toHaveBeenCalledWith(address);
  });

  it('should fallback to OSM if Google Maps fails', async () => {
    const address = 'Paris';
    const coordinate = createCoordinate();
    const googleSpy = jest
      .spyOn(googleProvider, 'geocode')
      .mockResolvedValue(null);
    const osmSpy = jest
      .spyOn(osmProvider, 'geocode')
      .mockResolvedValue(coordinate);

    const result = await service.geocode(address);

    expect(result).toEqual(coordinate);
    expect(googleSpy).toHaveBeenCalledWith(address);
    expect(osmSpy).toHaveBeenCalledWith(address);
  });

  it('should only use the specified provider when requested', async () => {
    const address = 'Paris';
    const coordinate = createCoordinate();
    const googleSpy = jest
      .spyOn(googleProvider, 'geocode')
      .mockResolvedValue(coordinate);
    const osmSpy = jest
      .spyOn(osmProvider, 'geocode')
      .mockResolvedValue(coordinate);

    const result = await service.geocode(
      address,
      GeocodingProviderType.OPEN_STREET_MAP,
    );

    expect(result).toEqual(coordinate);
    expect(googleSpy).not.toHaveBeenCalled();
    expect(osmSpy).toHaveBeenCalledWith(address);
  });

  it('should return null if all providers fail', async () => {
    const address = 'Unknown';
    const googleSpy = jest
      .spyOn(googleProvider, 'geocode')
      .mockResolvedValue(null);
    const osmSpy = jest.spyOn(osmProvider, 'geocode').mockResolvedValue(null);

    const result = await service.geocode(address);

    expect(result).toBeNull();
    expect(googleSpy).toHaveBeenCalled();
    expect(osmSpy).toHaveBeenCalled();
  });

  it('should return suggestions from Google Maps if successful', async () => {
    const query = 'Paris';
    const suggestions = ['Paris, France', 'Paris, TX'];
    const googleSpy = jest
      .spyOn(googleProvider, 'autocomplete')
      .mockResolvedValue(suggestions);

    const result = await service.autocomplete(query);

    expect(result).toEqual(suggestions);
    expect(googleSpy).toHaveBeenCalledWith(query);
  });

  it('should fallback to OSM autocomplete if Google Maps fails', async () => {
    const query = 'Paris';
    const suggestions = ['Paris, France'];
    const googleSpy = jest
      .spyOn(googleProvider, 'autocomplete')
      .mockResolvedValue([]);
    const osmSpy = jest
      .spyOn(osmProvider, 'autocomplete')
      .mockResolvedValue(suggestions);

    const result = await service.autocomplete(query);

    expect(result).toEqual(suggestions);
    expect(googleSpy).toHaveBeenCalledWith(query);
    expect(osmSpy).toHaveBeenCalledWith(query);
  });
});
