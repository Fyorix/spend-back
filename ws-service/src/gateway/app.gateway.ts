import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AppGateway.name);
  private readonly clientNames = new Map<string, string>();
  private readonly roomTransactions = new Map<string, any[]>();

  @WebSocketServer()
  server!: Server;

  afterInit(): void {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    const username = this.clientNames.get(client.id);
    this.clientNames.delete(client.id);
    this.logger.log(
      `Client disconnected: ${client.id} (${username || 'unknown'})`,
    );

    this.roomTransactions.forEach((transactions, room) => {
      const filtered = transactions.filter((t) => t.username !== username);
      if (filtered.length !== transactions.length) {
        this.roomTransactions.set(room, filtered);
        if (username) {
          this.server.to(room).emit('user_left_map', { username });
        }
      }
    });

    this.server.sockets.adapter.rooms.forEach((_sockets, room) => {
      this.broadcastRoomMembers(room);
    });
  }

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    client: Socket,
    payload: { room: string; username: string },
  ): Promise<void> {
    await client.join(payload.room);
    this.clientNames.set(client.id, payload.username);

    this.logger.log(
      `Client ${client.id} (${payload.username}) joined room: ${payload.room}`,
    );

    const currentState = this.roomTransactions.get(payload.room) || [];
    client.emit('map_current_state', currentState);

    this.broadcastRoomMembers(payload.room);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    client: Socket,
    payload: { room: string },
  ): Promise<void> {
    const username = this.clientNames.get(client.id);
    await client.leave(payload.room);
    this.logger.log(`Client ${client.id} left room: ${payload.room}`);

    if (username) {
      const transactions = this.roomTransactions.get(payload.room) || [];
      const filtered = transactions.filter((t) => t.username !== username);
      this.roomTransactions.set(payload.room, filtered);
      this.server.to(payload.room).emit('user_left_map', { username });
    }

    this.broadcastRoomMembers(payload.room);
  }

  @SubscribeMessage('map_transaction')
  handleMapTransaction(client: Socket, payload: any): void {
    const rooms = Array.from(client.rooms).filter((r) => r !== client.id);
    rooms.forEach((room) => {
      const transactions = this.roomTransactions.get(room) || [];
      const existingIndex = transactions.findIndex(
        (t) =>
          t.address.toLowerCase() === payload.address.toLowerCase() &&
          t.username === payload.username,
      );

      if (existingIndex > -1) {
        transactions[existingIndex].count =
          (transactions[existingIndex].count || 1) + 1;
      } else {
        transactions.push({ ...payload, count: 1 });
      }

      this.roomTransactions.set(room, transactions);
      this.server.to(room).emit('map_transaction', payload);
    });
  }

  private broadcastRoomMembers(room: string): void {
    const clientsInRoom = Array.from(
      this.server.sockets.adapter.rooms.get(room) || [],
    );
    const memberNames = clientsInRoom
      .map((id) => this.clientNames.get(id))
      .filter((name): name is string => !!name);

    this.server.to(room).emit('room_members', memberNames);
  }
}
