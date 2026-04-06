import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from './event-handler.interface.js';
import { WsEmitterService } from '../../gateway/ws-emitter.service.js';
import { FileEventType, FileUploadedEvent, WebSocketEvent } from '@clement.pasteau/shared';

@Injectable()
export class FileEventsHandler implements IEventHandler {
  private readonly logger = new Logger(FileEventsHandler.name);

  constructor(private readonly wsEmitter: WsEmitterService) {}

  handle(data: unknown): void {
    const event = data as Partial<FileUploadedEvent>;
    if (!event.type || event.payload === undefined) {
      this.logger.warn('Invalid file event received');
      return;
    }
    this.logger.debug(`File event [${event.type}]`);

    if (event.type === FileEventType.FILE_UPLOADED) {
      const payload = event.payload;
      this.logger.log(`File uploaded: ${payload.fileId} by user ${payload.userId}`);
      this.wsEmitter.emitToUser(payload.userId, WebSocketEvent.FILE_UPLOADED, payload);
    }
  }
}
