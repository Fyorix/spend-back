import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GeolocationGatewayController } from './application/controllers/geolocation.gateway.controller.js';
import { geolocationGrpcConfig } from './config/grpc.config.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'GEOLOCATION_PACKAGE',
        transport: Transport.GRPC,
        options: geolocationGrpcConfig as any,
      },
    ]),
  ],
  controllers: [GeolocationGatewayController],
  providers: [],
})
export class AppModule { }
