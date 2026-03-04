import { Module } from '@nestjs/common';
import { GatewayModule } from '../../gateway/gateway.module.js';
import { HandlerRegistry } from './handler.registry.js';
import { BroadcastHandler } from './broadcast.handler.js';
import { NotificationHandler } from './notification.handler.js';
import { UserEventsHandler } from './user-events.handler.js';
import { FileEventsHandler } from './file-events.handler.js';
import { GeolocationUpdatesHandler } from './geolocation-updates.handler.js';

@Module({
  imports: [GatewayModule],
  providers: [
    HandlerRegistry,
    BroadcastHandler,
    NotificationHandler,
    UserEventsHandler,
    FileEventsHandler,
    GeolocationUpdatesHandler,
  ],
  exports: [HandlerRegistry],
})
export class HandlersModule {}
