import { FileServiceClient, UploadFileRequest } from '@clement.pasteau/contracts';
import { Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ReplaySubject } from 'rxjs';

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

    const uploadStream = new ReplaySubject<UploadFileRequest>();

    uploadStream.next({
      metadata: {
        userId:"",
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    
    for (let offset = 0; offset < file.buffer.length; offset += CHUNK_SIZE) {
      const chunk = file.buffer.slice(offset, offset + CHUNK_SIZE);
      uploadStream.next({ chunk: new Uint8Array(chunk) });
    }
    uploadStream.complete();

    return (this.fileServiceClient as any).uploadFile(uploadStream.asObservable(), metadata);
  }
}
