import { GeolocalisationRepository } from '../../../infrastructure/database/geolocalisation.repository.js';
import { EventTag } from '@clement.pasteau/shared';
import { GeolocalisationModel } from '../../../infrastructure/database/models/geolocalisation.model.js';
import { jest } from '@jest/globals';
import { createCoordinate, createGeolocalisationEntity } from '../../helpers/factories.js';
import { Repository, InsertResult, SelectQueryBuilder } from 'typeorm';

describe('GeolocalisationRepository (Unit)', () => {
  let repository: GeolocalisationRepository;
  let mockTypeOrmRepository: Repository<GeolocalisationModel>;

  beforeEach(() => {
    mockTypeOrmRepository = {
      upsert: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as Partial<Repository<GeolocalisationModel>> as Repository<GeolocalisationModel>;

    repository = new GeolocalisationRepository(mockTypeOrmRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addTransaction', () => {
    it('should upsert a transaction with spatial point', async () => {
      const transactionId = 'tx-1';
      const coordinate = createCoordinate();
      const amount = 100;
      const tag = EventTag.FOOD;

      const upsertSpy = jest.spyOn(mockTypeOrmRepository, 'upsert').mockResolvedValue({
        identifiers: [],
        generatedMaps: [],
        raw: [],
      } as InsertResult);

      await repository.addTransaction(transactionId, coordinate, amount, tag);

      expect(upsertSpy).toHaveBeenCalledWith(
        {
          transactionId,
          location: {
            type: 'Point',
            coordinates: [coordinate.longitude, coordinate.latitude],
          },
          amount,
          tag,
        },
        ['transactionId'],
      );
    });
  });

  describe('findNearbyTransactions', () => {
    it('should search using ST_DWithin and return mapped results', async () => {
      const lat = 48.8566;
      const lng = 2.3522;
      const radius = 5;
      const tag = EventTag.FOOD;

      const mockEntity = createGeolocalisationEntity({
        transactionId: 'tx-1',
        amount: 100,
        tag: EventTag.FOOD,
        location: { type: 'Point', coordinates: [2.3522, 48.8566] },
      });

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn<() => Promise<GeolocalisationModel[]>>().mockResolvedValue([mockEntity]),
      };

      const createQueryBuilderSpy = jest
        .spyOn(mockTypeOrmRepository, 'createQueryBuilder')
        .mockReturnValue(
          mockQueryBuilder as Partial<
            SelectQueryBuilder<GeolocalisationModel>
          > as SelectQueryBuilder<GeolocalisationModel>,
        );

      const result = await repository.findNearbyTransactions(lat, lng, radius, tag);

      expect(createQueryBuilderSpy).toHaveBeenCalledWith('geo');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        transactionId: 'tx-1',
        latitude: 48.8566,
        longitude: 2.3522,
        amount: 100,
        tag: EventTag.FOOD,
      });
    });
  });
});
