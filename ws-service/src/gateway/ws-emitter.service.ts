import { Injectable } from '@nestjs/common';
import { AppGateway } from './app.gateway.js';
import {
  ZoneUpdatedPayload,
  TransactionPingedPayload,
} from '@clement.pasteau/shared';

@Injectable()
export class WsEmitterService {
  constructor(private readonly gateway: AppGateway) { }

  emitZoneUpdate(payload: ZoneUpdatedPayload): void {
    this.gateway.server.emit('zone-update', payload);
  }

  emitTransactionPing(userId: string, payload: TransactionPingedPayload): void {
    this.gateway.server.to(`user_${userId}`).emit('transaction-ping', payload);
  }

  broadcast(event: string, payload: unknown): void {
    this.gateway.server.emit(event, payload);
  }
}
