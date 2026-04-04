/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Logger,
  NotImplementedException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import {
  FILE_SERVICE_NAME,
  type UploadFileRequest,
  type FileResponse,
  type DeleteFileRequest,
  type EmptyResponse,
} from '@clement.pasteau/contracts';
import { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import { FileService } from '../services/file.service.js';
import { AuthGrpcGuard } from '../guards/auth-grpc.guard.js';

@Controller()
export class FileCommandController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGrpcGuard)
  @GrpcStreamMethod(FILE_SERVICE_NAME, 'UploadFile')
  async uploadFile(
    _request: Observable<UploadFileRequest>,
    context: Metadata,
  ): Promise<FileResponse> {
    //   _request.subscribe({
    //   next: () => Logger.debug('Controller next'),
    //   error: (err) => Logger.error('Controller error', err),
    //   complete: () => Logger.debug('Controller complete ← jamais affiché ?'),
    // });
    const userId = context.get('userId')[0]?.toString();
    if (!userId) {
      throw new UnauthorizedException('User ID is missing in context');
    }
    const fileEntity = await this.fileService.uploadFile(userId, _request);
    return {
      file: {
        id: fileEntity.id?.toString() || '',
        userId: fileEntity.userId,
        originalName: fileEntity.originalName,
        mimeType: fileEntity.mimeType,
        size: fileEntity.size,
        minioKey: fileEntity.minioKey,
      },
    };
  }

  @GrpcMethod(FILE_SERVICE_NAME, 'DeleteFile')
  async deleteFile(_request: DeleteFileRequest): Promise<EmptyResponse> {
    Logger.log('DELETE FILE NOT IMPLEMENTED');
    throw new NotImplementedException();
  }
}
