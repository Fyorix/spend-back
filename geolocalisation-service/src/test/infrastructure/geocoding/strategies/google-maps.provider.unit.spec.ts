import { GoogleMapsProvider } from '../../../../infrastructure/geocoding/strategies/google-maps.provider.js';
import { jest } from '@jest/globals';
import {
  createMockFetchResponse,
  createGoogleMapsGeocodeResponse,
} from '../../../helpers/factories.js';

describe('GoogleMapsProvider (Unit)', () => {
  let provider: GoogleMapsProvider;
  const apiKey = 'test-api-key';

  beforeEach(() => {
    provider = new GoogleMapsProvider(apiKey);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return coordinates for a valid address', async () => {
    const address = 'Paris';
    const mockResponse = createGoogleMapsGeocodeResponse();
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(createMockFetchResponse(mockResponse));

    const result = await provider.geocode(address);

    expect(result).toEqual({ latitude: 48.8566, longitude: 2.3522 });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${encodeURIComponent(address)}&key=${apiKey}`),
      undefined,
    );
  });

  it('should return null for no results', async () => {
    const address = 'Empty';
    const mockResponse = { results: [] };
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(createMockFetchResponse(mockResponse));

    const result = await provider.geocode(address);

    expect(result).toBeNull();
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should return null if fetch throws error', async () => {
    const address = 'Empty';
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Network error'));

    const result = await provider.geocode(address);

    expect(result).toBeNull();
    expect(fetchSpy).toHaveBeenCalled();
  });
  it('should return its name', () => {
    expect(provider.getName()).toBe('GoogleMaps');
  });
});
