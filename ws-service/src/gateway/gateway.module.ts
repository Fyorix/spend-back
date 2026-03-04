import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway.js';
import { WsEmitterService } from './ws-emitter.service.js';

@Module({
  providers: [AppGateway, WsEmitterService],
  exports: [AppGateway, WsEmitterService],
})
export class GatewayModule {}
