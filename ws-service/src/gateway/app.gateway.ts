import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketEvent } from '@clement.pasteau/shared';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class AppGateway
  implements
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnModuleInit {
  private readonly logger = new Logger(AppGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor() { }

  onModuleInit() {
    this.logger.log('WebSocket Gateway initialized (identifying via x-user-id header)');
  }

  afterInit(): void {
    this.logger.log('WebSocket Gateway server ready');
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const userId = client.handshake.headers['x-user-id'] as string;

    if (!userId) {
      this.logger.warn(
        `Client ${client.id} connected without x-user-id header. Handshake Headers: ${JSON.stringify(client.handshake.headers)}`,
      );
      client.disconnect();
    } else {
      client.userId = userId;
    }

    this.logger.log(
      `Client ${client.id} authenticated as User ${client.userId}`,
    );

    if (client.userId !== 'guest') {
      await client.join(`user_${client.userId}`);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(
      `Client disconnected: ${client.id} (User: ${client.userId})`,
    );
  }

  emitUserPing(userId: string, data: unknown): void {
    this.server.to(`user_${userId}`).emit(WebSocketEvent.TRANSACTION_PING, data);
  }

  emitZoneUpdate(data: unknown): void {
    this.server.emit(WebSocketEvent.ZONE_UPDATE, data);
  }
}
