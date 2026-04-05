import { FileServiceClient, UploadFileRequest } from '@clement.pasteau/contracts';
import { Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Subject } from 'rxjs';

const CHUNK_SIZE = 64 * 1024;

@Injectable()
export class FileGatewayService implements OnModuleInit {
  private fileServiceClient!: FileServiceClient;
  constructor(@Inject('FILE_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.fileServiceClient = this.client.getService<FileServiceClient>('FileService');
  }

  async sendToGrpc(file: Express.Multer.File, token: string) {
    const metadata = new Metadata();
    metadata.add('Authorization', `Bearer ${token}`);

    const uploadStream = new Subject<UploadFileRequest>();

    const response$ = (this.fileServiceClient as any).uploadFile(
      uploadStream.asObservable(),
      metadata,
    );

    const pushData = async () => {
      uploadStream.next({
        metadata: {
          userId: '',
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      } as UploadFileRequest);

      for (let offset = 0; offset < file.buffer.length; offset += CHUNK_SIZE) {
        const chunk = new Uint8Array(file.buffer.slice(offset, offset + CHUNK_SIZE));
        uploadStream.next({ chunk } as UploadFileRequest);
      }

      uploadStream.complete();
    };

    const responsePromise = firstValueFrom(response$);
    pushData().catch((error: unknown) => {
      uploadStream.error(error instanceof Error ? error : new Error('Upload stream failed'));
    });
    return responsePromise;
  }
}
