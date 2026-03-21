import { GeolocationApplicationService } from '../../../application/services/geolocation.application.service.js';
import { GeocodingService } from '../../../infrastructure/geocoding/geocoding.service.js';
import { GeolocalisationRepository } from '../../../infrastructure/database/geolocalisation.repository.js';
import { GeocodingProviderType } from '../../../domain/geocoding/geocoding.provider.js';
import { EventTag } from '@clement.pasteau/shared';
import { jest } from '@jest/globals';
import { createCoordinate } from '../../helpers/factories.js';

describe('GeolocationApplicationService (Unit)', () => {
  let service: GeolocationApplicationService;
  let mockGeocodingService: GeocodingService;
  let mockRepository: GeolocalisationRepository;

  beforeEach(() => {
    mockGeocodingService = {
      geocode: jest.fn(),
    } as unknown as GeocodingService;

    mockRepository = {
      addTransaction: jest.fn(),
      findNearbyTransactions: jest.fn(),
    } as unknown as GeolocalisationRepository;

    service = new GeolocationApplicationService(
      mockGeocodingService,
      mockRepository,
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
    const tag = EventTag.FOOD;

    const geocodeSpy = jest
      .spyOn(mockGeocodingService, 'geocode')
      .mockResolvedValue(coordinate);
    const addTransactionSpy = jest
      .spyOn(mockRepository, 'addTransaction')
      .mockResolvedValue();

    const result = await service.trackTransaction(
      transactionId,
      address,
      amount,
      provider,
      tag,
    );

    expect(result).toEqual(coordinate);
    expect(geocodeSpy).toHaveBeenCalledWith(address, provider);
    expect(addTransactionSpy).toHaveBeenCalledWith(
      transactionId,
      coordinate,
      amount,
      tag,
    );
  });

  it('should return null if geocoding fails', async () => {
    const transactionId = 'tx-1';
    const address = 'Unknown Address';
    const amount = 100.5;
    const tag = EventTag.FOOD;

    const geocodeSpy = jest
      .spyOn(mockGeocodingService, 'geocode')
      .mockResolvedValue(null);

    const addTransactionSpy = jest.spyOn(mockRepository, 'addTransaction');

    const result = await service.trackTransaction(
      transactionId,
      address,
      amount,
      GeocodingProviderType.OPEN_STREET_MAP,
      tag,
    );

    expect(result).toBeNull();
    expect(geocodeSpy).toHaveBeenCalledWith(
      address,
      GeocodingProviderType.OPEN_STREET_MAP,
    );
    expect(addTransactionSpy).not.toHaveBeenCalled();
  });

  it('should return nearby transactions', async () => {
    const lat = 1;
    const lng = 2;
    const radius = 10;
    const tag = EventTag.FOOD;
    const transactions = [
      {
        transactionId: '1',
        latitude: 1.1,
        longitude: 2.1,
        amount: 100,
        tag: EventTag.FOOD,
      },
    ];

    const findNearbySpy = jest
      .spyOn(mockRepository, 'findNearbyTransactions')
      .mockResolvedValue(transactions);

    const result = await service.getNearbyTransactions(lat, lng, radius, tag);

    expect(result).toEqual(transactions);
    expect(findNearbySpy).toHaveBeenCalledWith(lat, lng, radius, tag);
  });
});
