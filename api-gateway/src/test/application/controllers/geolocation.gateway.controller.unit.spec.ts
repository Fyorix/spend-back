import { GeolocationGatewayController } from '../../../application/controllers/geolocation.gateway.controller.js';
import { of } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { jest } from '@jest/globals';

describe('GeolocationGatewayController Unit Tests', () => {
  let controller: GeolocationGatewayController;
  let mockClient: jest.Mocked<ClientGrpc>;
  let mockService: {
    trackTransaction: jest.MockedFunction<any>;
    getNearbyTransactions: jest.MockedFunction<any>;
  };

  beforeEach(() => {
    mockService = {
      trackTransaction: jest.fn(),
      getNearbyTransactions: jest.fn(),
    } as any;

    mockClient = {
      getService: jest.fn().mockReturnValue(mockService),
    } as any;

    controller = new GeolocationGatewayController(mockClient);
    controller.onModuleInit();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should track a transaction successfully', async () => {
    const request = {
      transactionId: '123',
      address: 'Test Address',
      amount: 100,
    };

    const response = {
      success: true,
      message: 'Success',
      latitude: 10,
      longitude: 20,
    };

    const spy = jest.spyOn(mockService, 'trackTransaction').mockReturnValue(of(response));

    const result = await controller.trackTransaction(request as any);

    expect(spy).toHaveBeenCalledWith(request);
    expect(result).toEqual(response);
  });

  it('should get nearby transactions', async () => {
    const query = {
      latitude: 10,
      longitude: 20,
      radiusKm: 5,
    };

    const response = {
      transactions: [],
    };

    const spy = jest.spyOn(mockService, 'getNearbyTransactions').mockReturnValue(of(response));

    const result = await controller.getNearbyTransactions(query as any);

    expect(spy).toHaveBeenCalledWith(query);
    expect(result).toEqual(response);
  });
});
