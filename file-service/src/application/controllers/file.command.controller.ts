/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, Logger, NotImplementedException, Post } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import {
  FILE_SERVICE_NAME,
  type UploadFileRequest,
  type FileResponse,
  type DeleteFileRequest,
  type EmptyResponse,
} from '@clement.pasteau/contracts';
import { Observable, of } from 'rxjs';
import { FileService } from '../services/file.service.js';

@Controller()
export class FileCommandController {
  constructor(private readonly fileService: FileService) {}

  @GrpcStreamMethod(FILE_SERVICE_NAME, 'UploadFile')
  async uploadFile(
    _request: Observable<UploadFileRequest>,
  ): Promise<FileResponse> {
    Logger.log('UPLOAD FILE NOT IMPLEMENTED');
    throw new NotImplementedException();
  }

  @GrpcMethod(FILE_SERVICE_NAME, 'DeleteFile')
  async deleteFile(_request: DeleteFileRequest): Promise<EmptyResponse> {
    Logger.log('DELETE FILE NOT IMPLEMENTED');
    throw new NotImplementedException();
  }

  // This method is for testing purposes only, to be removed later
  @Post('test-upload')
  async testUpload() {
    const buffer = Buffer.from('Contenu de test pour mon POC');
    const chunks = of(new Uint8Array(buffer));

    return await this.fileService.uploadFile(
      'user-123',
      'image-test.png',
      'image/png',
      buffer.length,
      chunks,
    );
  }
}
