import { Controller, Post, Body, Get, Query, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBody, ApiQuery } from '@nestjs/swagger';
import {
  GEOLOCATION_SERVICE_NAME,
  type GeolocationServiceClient,
  type TrackTransactionRequest,
  type TrackTransactionResponse,
  type GetNearbyTransactionsRequest,
  type GetNearbyTransactionsResponse,
  type AutocompleteRequest,
  type AutocompleteResponse,
} from '@clement.pasteau/contracts';
import { firstValueFrom } from 'rxjs';

class TrackTransactionDto implements TrackTransactionRequest {
  @ApiProperty()
  transactionId!: string;
  @ApiProperty()
  userId!: string;
  @ApiProperty()
  address!: string;
  @ApiProperty()
  amount!: number;
  @ApiProperty({ required: false, enum: ['GoogleMaps', 'OpenStreetMap'] })
  provider?: string;
}

class GetNearbyTransactionsDto implements GetNearbyTransactionsRequest {
  @ApiProperty()
  latitude!: number;
  @ApiProperty()
  longitude!: number;
  @ApiProperty()
  radiusKm!: number;
}

class AutocompleteDto implements AutocompleteRequest {
  @ApiProperty()
  query!: string;
  @ApiProperty({ required: false, enum: ['GoogleMaps', 'OpenStreetMap'] })
  provider?: string;
}

@ApiTags('Geolocation')
@Controller('geolocation')
export class GeolocationGatewayController implements OnModuleInit {
  private geolocationService!: GeolocationServiceClient;

  constructor(@Inject('GEOLOCATION_PACKAGE') private readonly client: ClientGrpc) { }

  onModuleInit() {
    this.geolocationService = this.client.getService<GeolocationServiceClient>(GEOLOCATION_SERVICE_NAME);
  }

  @Post('track')
  @ApiOperation({ summary: 'Track a transaction and store its location' })
  @ApiBody({
    type: TrackTransactionDto,
    examples: {
      OpenStreetMap: {
        summary: 'Template with OpenStreetMap',
        description: 'Track a transaction using OpenStreetMap for geocoding',
        value: {
          transactionId: 'tx-123456789',
          userId: 'user-789',
          address: '10 Downing Street, London, UK',
          amount: 12.5,
          provider: 'OpenStreetMap',
        },
      },
      GoogleMaps: {
        summary: 'Template with Google Maps',
        description: 'Track a transaction using Google Maps for geocoding',
        value: {
          transactionId: 'tx-987654321',
          userId: 'user-123',
          address: '1600 Amphitheatre Parkway, Mountain View, CA, USA',
          amount: 25.0,
          provider: 'GoogleMaps',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Transaction tracked successfully' })
  async trackTransaction(
    @Body() request: TrackTransactionDto,
  ): Promise<TrackTransactionResponse> {
    return firstValueFrom(this.geolocationService.trackTransaction(request));
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Get transactions near a location' })
  @ApiResponse({ status: 200, description: 'Nearby transactions found' })
  async getNearbyTransactions(
    @Query() query: GetNearbyTransactionsDto,
  ): Promise<GetNearbyTransactionsResponse> {
    return firstValueFrom(this.geolocationService.getNearbyTransactions({
      latitude: Number(query.latitude),
      longitude: Number(query.longitude),
      radiusKm: Number(query.radiusKm),
    }));
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Get address suggestions based on query' })
  @ApiQuery({ name: 'query', example: 'Paris, France', description: 'Address search query' })
  @ApiQuery({ name: 'provider', enum: ['GoogleMaps', 'OpenStreetMap'], required: false })
  @ApiResponse({ status: 200, description: 'Address suggestions found' })
  async autocomplete(
    @Query() query: AutocompleteDto,
  ): Promise<AutocompleteResponse> {
    return firstValueFrom(this.geolocationService.autocomplete(query));
  }
}
