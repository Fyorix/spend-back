import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeolocationController } from './application/controllers/geolocation.controller.js';
import { GeolocationApplicationService } from './application/services/geolocation.application.service.js';
import { GeocodingService } from './infrastructure/geocoding/geocoding.service.js';
import { GeolocalisationRepository } from './infrastructure/database/geolocalisation.repository.js';
import { GeolocalisationModel } from './infrastructure/database/models/geolocalisation.model.js';
import { loadEnvConfig } from './config/env.config.js';

const config = loadEnvConfig();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.dbHost,
      port: config.dbPort,
      username: config.dbUser,
      password: config.dbPass,
      database: config.dbName,
      entities: [GeolocalisationModel],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([GeolocalisationModel]),
  ],
  controllers: [GeolocationController],
  providers: [
    GeolocationApplicationService,
    GeocodingService,
    GeolocalisationRepository,
  ],
})
export class AppModule {}
