import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { RedisController } from './redis.controller';

@Module({
  imports: [],
  controllers: [RedisController],
  providers: [AppGateway],
})
export class AppModule {}
