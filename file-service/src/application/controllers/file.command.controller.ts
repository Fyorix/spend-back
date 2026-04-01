/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Logger,
  NotImplementedException,
  Post,
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
import { Observable, of } from 'rxjs';
import { FileService } from '../services/file.service.js';
import { AuthGrpcGuard } from '../guards/auth-grpc.guard.js';

@Controller()
export class FileCommandController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthGrpcGuard)
  @GrpcStreamMethod(FILE_SERVICE_NAME, 'UploadFile')
  async uploadFile(_request: Observable<UploadFileRequest>, context: any): Promise<FileResponse> {
    const userId = context?.userId;
    if (!userId) {
      throw new UnauthorizedException('User ID is missing in context');
    }
    throw new NotImplementedException();
  }

  @GrpcMethod(FILE_SERVICE_NAME, 'DeleteFile')
  async deleteFile(_request: DeleteFileRequest): Promise<EmptyResponse> {
    Logger.log('DELETE FILE NOT IMPLEMENTED');
    throw new NotImplementedException();
  }
}
