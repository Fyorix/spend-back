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
  type AutocompleteRequest,
  type AutocompleteResponse,
} from '@clement.pasteau/contracts';
import { GeolocationApplicationService } from '../services/geolocation.application.service.js';
import { GeocodingProviderType } from '../../domain/geocoding/geocoding.provider.js';

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
    );

    return {
      transactions: transactions.map((t) => ({
        transactionId: t.transactionId,
        latitude: t.latitude,
        longitude: t.longitude,
        amount: t.amount,
      })),
    };
  }

  @GrpcMethod(GEOLOCATION_SERVICE_NAME, 'Autocomplete')
  async autocomplete(
    request: AutocompleteRequest,
  ): Promise<AutocompleteResponse> {
    const suggestions = await this.geolocationService.autocomplete(
      request.query,
      request.provider as GeocodingProviderType,
    );
    return { suggestions };
  }
}
