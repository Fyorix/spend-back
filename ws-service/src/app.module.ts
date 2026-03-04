import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';
import { GatewayModule } from './gateway/gateway.module.js';
import { HandlersModule } from './application/handlers/handlers.module.js';
import { RedisSubService } from './infrastructure/redis/redis-sub.service.js';

@Module({
  imports: [InfrastructureModule, GatewayModule, HandlersModule],
  providers: [RedisSubService],
})
export class AppModule {}
