import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RedisPubService } from '../infrastructure/redis/redis-pub.service.js';
import { RedisChannel } from '../domain/events/redis-channels.enum.js';

@ApiTags('Events')
@Controller('events')
export class EventTestController {
  private readonly logger = new Logger(EventTestController.name);

  constructor(private readonly redisPub: RedisPubService) {}

  @Get('ping-ws')
  @ApiOperation({ summary: 'Send a ping to the WebSocket service via Redis' })
  @ApiResponse({ status: 200, description: 'Ping sent successfully' })
  async pingWs() {
    this.logger.log('Sending PING to WebSocket service via Redis');
    await this.redisPub.publish(RedisChannel.GEOLOCATION_UPDATES, {
      event: 'ping_from_geoloc',
      payload: {
        message: 'Hello from geolocalisation-service!',
        timestamp: new Date().toISOString(),
      },
    });

    return { message: 'Ping sent to WebSocket service' };
  }

  @Get('ping-2')
  @ApiOperation({ summary: 'Send a targeted ping to a room' })
  async pingRoom() {
    this.logger.log('Sending PING-2 to specific room');
    await this.redisPub.publish(RedisChannel.GEOLOCATION_UPDATES, {
      event: 'ping-2',
      payload: {
        room: 'vip-room',
        message: 'Exclusive update for VIPs!',
        sender: 'GeolocalisationService',
      },
    });

    return { message: 'Ping-2 sent to room vip-room' };
  }
}
