import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeolocationController } from './application/controllers/geolocation.controller.js';
import { GeolocationApplicationService } from './application/services/geolocation.application.service.js';
import { GeocodingService } from './infrastructure/geocoding/geocoding.service.js';
import { GeolocalisationRepository } from './infrastructure/database/geolocalisation.repository.js';
import { RedisSubService } from './infrastructure/redis/redis-sub.service.js';
import { GeolocalisationModel } from './infrastructure/database/models/geolocalisation.model.js';
import { MapZoneModel } from './infrastructure/database/models/map-zone.model.js';
import { RedisModule } from './infrastructure/redis/redis.module.js';
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
      entities: [GeolocalisationModel, MapZoneModel],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([GeolocalisationModel, MapZoneModel]),
    RedisModule,
  ],
  controllers: [GeolocationController],
  providers: [
    GeolocationApplicationService,
    GeocodingService,
    GeolocalisationRepository,
    RedisSubService,
  ],
})
export class AppModule {}
