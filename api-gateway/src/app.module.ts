import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { GeolocationGatewayController } from './application/controllers/geolocation.gateway.controller.js';
import { UserGatewayController } from './application/controllers/user.gateway.controller.js';
import { TransactionGatewayController } from './application/controllers/transaction.gateway.controller.js';
import {
  geolocationGrpcConfig,
  userGrpcConfig,
  accountGrpcConfig,
} from './config/grpc.config.js';
import { AuthGuard } from './application/guards/auth.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    }),
    ClientsModule.register([
      {
        name: 'GEOLOCATION_PACKAGE',
        transport: Transport.GRPC,
        options: geolocationGrpcConfig,
      },
      {
        name: 'USER_PACKAGE',
        transport: Transport.GRPC,
        options: userGrpcConfig,
      },
      {
        name: 'ACCOUNT_PACKAGE',
        transport: Transport.GRPC,
        options: accountGrpcConfig,
      },
    ]),
  ],
  controllers: [
    GeolocationGatewayController,
    UserGatewayController,
    TransactionGatewayController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }
