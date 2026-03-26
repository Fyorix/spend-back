import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventTag } from '@clement.pasteau/shared';
import { GeolocalisationModel } from './models/geolocalisation.model.js';
import { Coordinate } from '../../domain/geocoding/geocoding.provider.js';
import { NearbyTransaction } from '../../domain/geocoding/geolocalisation.interface.js';
import type { Point } from 'geojson';

@Injectable()
export class GeolocalisationRepository {
  private readonly logger = new Logger(GeolocalisationRepository.name);

  constructor(
    @InjectRepository(GeolocalisationModel)
    private readonly repository: Repository<GeolocalisationModel>,
  ) {}

  async addTransaction(
    transactionId: string,
    coordinate: Coordinate,
    amount: number,
    tag: EventTag,
  ): Promise<void> {
    const point: Point = {
      type: 'Point',
      coordinates: [coordinate.longitude, coordinate.latitude],
    };

    const data: Partial<GeolocalisationModel> = {
      transactionId,
      location: point,
      amount,
      tag,
    };

    await this.repository.upsert(data, ['transactionId']);
    this.logger.log(
      `Saved transaction ${transactionId} with tag ${tag} via TypeORM`,
    );
  }

  async findNearbyTransactions(
    latitude: number,
    longitude: number,
    radiusKm: number,
    tag?: EventTag,
  ): Promise<NearbyTransaction[]> {
    const query = this.repository
      .createQueryBuilder('geo')
      .select(['geo.transactionId', 'geo.amount', 'geo.location', 'geo.tag'])
      .where(
        'ST_DWithin(geo.location, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326), :radius)',
        {
          lng: longitude,
          lat: latitude,
          radius: radiusKm * 1000,
        },
      );

    if (tag) {
      query.andWhere('geo.tag = :tag', { tag });
    }

    const results: GeolocalisationModel[] = await query.getMany();

    return results.map((res: GeolocalisationModel): NearbyTransaction => {
      const { transactionId, amount, location, tag: resTag } = res;
      const point = location;
      return {
        transactionId,
        longitude: point.coordinates[0],
        latitude: point.coordinates[1],
        amount: Number(amount),
        tag: resTag,
      };
    });
  }
}
