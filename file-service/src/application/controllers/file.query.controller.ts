/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, Logger, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  FILE_SERVICE_NAME,
  type GetFileRequest,
  type FileResponse,
  type GetUserFilesRequest,
  type FileListResponse,
} from '@clement.pasteau/contracts';

import { FileService } from '../services/file.service.js';
@Controller()
export class FileQueryController {
  constructor(private readonly fileService: FileService) {}

  @GrpcMethod(FILE_SERVICE_NAME, 'GetFile')
  async getFile(_request: GetFileRequest): Promise<FileResponse> {
    Logger.log('GET FILE NOT IMPLEMENTED');
    throw new NotImplementedException();
  }

  @GrpcMethod(FILE_SERVICE_NAME, 'GetUserFiles')
  async getUserFiles(_request: GetUserFilesRequest): Promise<FileListResponse> {
    const userId = _request.userId;
    if (!userId) {
      throw new UnauthorizedException('User ID is missing in context');
    }
    const filesEntities = await this.fileService.getUserFiles(userId);
    return {
      files: filesEntities.map((fileEntity) => ({
        id: fileEntity.id?.toString() || '',
        userId: fileEntity.userId,
        originalName: fileEntity.originalName,
        mimeType: fileEntity.mimeType,
        size: fileEntity.size,
        minioKey: fileEntity.minioKey,
        url: '',
      })),
    };
  }
}
