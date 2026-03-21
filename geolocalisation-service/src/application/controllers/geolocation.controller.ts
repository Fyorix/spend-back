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
} from '@clement.pasteau/contracts';
import { GeolocationApplicationService } from '../services/geolocation.application.service.js';
import { GeocodingProviderType } from '../../domain/geocoding/geocoding.provider.js';
import { EventTag } from '@clement.pasteau/shared';

@Controller()
@GeolocationServiceControllerMethods()
export class GeolocationController implements GeolocationServiceController {
  constructor(
    private readonly geolocationService: GeolocationApplicationService,
  ) {}

  @GrpcMethod(GEOLOCATION_SERVICE_NAME, 'TrackTransaction')
  async trackTransaction(
    request: TrackTransactionRequest,
  ): Promise<TrackTransactionResponse> {
    const coordinate = await this.geolocationService.trackTransaction(
      request.transactionId,
      request.address,
      request.amount,
      request.provider as GeocodingProviderType,
      request.tag as EventTag,
    );

    if (!coordinate) {
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
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
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
}
