import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppGateway } from './app.gateway';

@Controller()
export class RedisController {
  constructor(private readonly appGateway: AppGateway) {}

  @EventPattern('broadcast')
  handleBroadcast(@Payload() data: { event: string; payload: any }) {
    this.appGateway.server.emit(data.event, data.payload);
  }
}
