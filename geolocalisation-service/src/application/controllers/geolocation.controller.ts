import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GeolocationServiceController,
  GeolocationServiceControllerMethods,
  GEOLOCATION_SERVICE_NAME,
  type TrackTransactionRequest,
  type TrackTransactionResponse,
  type GetNearbyTransactionsRequest,
  type GetNearbyTransactionsResponse,
  type GetMapZonesRequest,
  type GetMapZonesResponse,
} from '@clement.pasteau/contracts';
import { GeolocationApplicationService } from '../services/geolocation.application.service.js';
import { GeocodingProviderType } from '../../domain/geocoding/geocoding.provider.js';
import { EventTag } from '@clement.pasteau/shared';
import { MapZoneModel } from '../../infrastructure/database/models/map-zone.model.js';

@Controller()
@GeolocationServiceControllerMethods()
export class GeolocationController implements GeolocationServiceController {
  constructor(private readonly geolocationService: GeolocationApplicationService) {}

  @GrpcMethod(GEOLOCATION_SERVICE_NAME, 'TrackTransaction')
  async trackTransaction(request: TrackTransactionRequest): Promise<TrackTransactionResponse> {
    const result = await this.geolocationService.trackTransaction(
      request.transactionId,
      request.address,
      request.amount,
      request.provider as GeocodingProviderType,
      (request.tag as EventTag) || EventTag.OTHER,
    );

    if (!result || !result.coordinate) {
      return {
        success: false,
        message: 'Failed to geocode address',
        latitude: 0,
        longitude: 0,
      };
    }

    return {
      success: true,
      message: 'Transaction tracked successfully',
      latitude: result.coordinate.latitude,
      longitude: result.coordinate.longitude,
    };
  }

  @GrpcMethod(GEOLOCATION_SERVICE_NAME, 'GetNearbyTransactions')
  async getNearbyTransactions(
    request: GetNearbyTransactionsRequest,
  ): Promise<GetNearbyTransactionsResponse> {
    const transactions = await this.geolocationService.getNearbyTransactions(
      request.latitude,
      request.longitude,
      request.radiusKm,
      request.tag ? (request.tag as EventTag) : undefined,
    );

    return {
      transactions: transactions.map((t) => ({
        transactionId: t.transactionId,
        latitude: t.latitude,
        longitude: t.longitude,
        amount: t.amount,
        tag: t.tag || '',
      })),
    };
  }

  @GrpcMethod(GEOLOCATION_SERVICE_NAME, 'GetMapZones')
  async getMapZones(request: GetMapZonesRequest): Promise<GetMapZonesResponse> {
    const zones: MapZoneModel[] = await this.geolocationService.getZones(
      request.tag ? (request.tag as EventTag) : undefined,
    );
    return {
      zones: zones.map((z) => ({
        id: z.id,
        latitude: z.location.coordinates[1],
        longitude: z.location.coordinates[0],
        weight: z.weight,
        radius: z.radius,
        tag: z.tag,
      })),
    };
  }
}
