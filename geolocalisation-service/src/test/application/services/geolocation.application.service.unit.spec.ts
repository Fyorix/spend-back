import { GeolocationApplicationService } from '../../../application/services/geolocation.application.service.js';
import { GeocodingService } from '../../../infrastructure/geocoding/geocoding.service.js';
import { RedisGeolocationRepository } from '../../../infrastructure/redis/redis.repository.js';
import { GeocodingProviderType } from '../../../domain/geocoding/geocoding.provider.js';
import { jest } from '@jest/globals';
import { createCoordinate } from '../../helpers/factories.js';

describe('GeolocationApplicationService (Unit)', () => {
  let service: GeolocationApplicationService;
  let mockGeocodingService: GeocodingService;
  let mockRedisRepository: RedisGeolocationRepository;

  beforeEach(() => {
    mockGeocodingService = {
      geocode: jest.fn(),
      autocomplete: jest.fn(),
    } as unknown as GeocodingService;

    mockRedisRepository = {
      addTransaction: jest.fn(),
      findNearbyTransactions: jest.fn(),
    } as unknown as RedisGeolocationRepository;

    service = new GeolocationApplicationService(
      mockGeocodingService,
      mockRedisRepository,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should track a transaction and return its coordinates', async () => {
    const transactionId = 'tx-1';
    const address = '123 Fake St';
    const amount = 100.5;
    const coordinate = createCoordinate();
    const provider = GeocodingProviderType.OPEN_STREET_MAP;

    const geocodeSpy = jest
      .spyOn(mockGeocodingService, 'geocode')
      .mockResolvedValue(coordinate);
    const addTransactionSpy = jest
      .spyOn(mockRedisRepository, 'addTransaction')
      .mockResolvedValue();

    const result = await service.trackTransaction(
      transactionId,
      address,
      amount,
      provider,
    );

    expect(result).toEqual(coordinate);
    expect(geocodeSpy).toHaveBeenCalledWith(address, provider);
    expect(addTransactionSpy).toHaveBeenCalledWith(
      transactionId,
      coordinate,
      amount,
    );
  });

  it('should return null if geocoding fails', async () => {
    const transactionId = 'tx-1';
    const address = 'Unknown Address';
    const amount = 100.5;

    const geocodeSpy = jest
      .spyOn(mockGeocodingService, 'geocode')
      .mockResolvedValue(null);

    const addTransactionSpy = jest.spyOn(mockRedisRepository, 'addTransaction');

    const result = await service.trackTransaction(
      transactionId,
      address,
      amount,
    );

    expect(result).toBeNull();
    expect(geocodeSpy).toHaveBeenCalledWith(address, undefined);
    expect(addTransactionSpy).not.toHaveBeenCalled();
  });

  it('should return address suggestions via autocomplete', async () => {
    const query = 'Paris';
    const suggestions = ['Paris, France'];

    const autocompleteSpy = jest
      .spyOn(mockGeocodingService, 'autocomplete')
      .mockResolvedValue(suggestions);

    const result = await service.autocomplete(query);

    expect(result).toEqual(suggestions);
    expect(autocompleteSpy).toHaveBeenCalledWith(query, undefined);
  });
});
