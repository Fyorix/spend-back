import { Injectable } from '@nestjs/common';
import { AppGateway } from './app.gateway.js';

@Injectable()
export class WsEmitterService {
  constructor(private readonly gateway: AppGateway) {}

  broadcast(event: string, payload: unknown): void {
    this.gateway.server.emit(event, payload);
  }

  emitToRoom(room: string, event: string, payload: unknown): void {
    this.gateway.server.to(room).emit(event, payload);
  }

  emitToSocket(socketId: string, event: string, payload: unknown): void {
    this.gateway.server.to(socketId).emit(event, payload);
  }
}
