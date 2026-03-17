/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, Logger, NotImplementedException } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import {
  FILE_SERVICE_NAME,
  type UploadFileRequest,
  type FileResponse,
  type DeleteFileRequest,
  type EmptyResponse,
} from '@clement.pasteau/contracts';
import { Observable } from 'rxjs';

@Controller()
export class FileCommandController {
  constructor() { }

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
}
