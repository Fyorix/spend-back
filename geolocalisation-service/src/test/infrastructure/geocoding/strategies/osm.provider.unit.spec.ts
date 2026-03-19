import { OpenStreetMapProvider } from '../../../../infrastructure/geocoding/strategies/osm.provider.js';
import { jest } from '@jest/globals';
import {
  createMockFetchResponse,
  createOsmGeocodeResponse,
  createOsmAutocompleteResponse,
} from '../../../helpers/factories.js';

describe('OpenStreetMapProvider (Unit)', () => {
  let provider: OpenStreetMapProvider;

  beforeEach(() => {
    provider = new OpenStreetMapProvider();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return coordinates for a valid address', async () => {
    const address = 'Paris';
    const mockResponse = createOsmGeocodeResponse();
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(createMockFetchResponse(mockResponse));

    const result = await provider.geocode(address);

    expect(result).toEqual({ latitude: 48.8566, longitude: 2.3522 });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(address)),
      expect.anything(),
    );
  });

  it('should return null for no results', async () => {
    const address = 'Empty';
    const mockResponse: object[] = [];
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

  it('should return suggestions for a valid query', async () => {
    const query = 'Paris';
    const mockResponse = createOsmAutocompleteResponse(['Paris, France']);
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(createMockFetchResponse(mockResponse));

    const result = await provider.autocomplete(query);

    expect(result).toEqual(['Paris, France']);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should return its name', () => {
    expect(provider.getName()).toBe('OpenStreetMap');
  });
});
