import { Module } from '@nestjs/common';
import { GeolocationController } from './application/controllers/geolocation.controller.js';
import { GeolocationApplicationService } from './application/services/geolocation.application.service.js';
import { GeocodingService } from './infrastructure/geocoding/geocoding.service.js';
import { RedisGeolocationRepository } from './infrastructure/redis/redis.repository.js';

@Module({
  imports: [],
  controllers: [GeolocationController],
  providers: [
    GeolocationApplicationService,
    GeocodingService,
    RedisGeolocationRepository,
  ],
})
export class AppModule {}
