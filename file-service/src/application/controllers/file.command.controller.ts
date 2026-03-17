/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, NotImplementedException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
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
  constructor() {}

  @GrpcMethod(FILE_SERVICE_NAME, 'UploadFile')
  async uploadFile(
    _request: Observable<UploadFileRequest>,
  ): Promise<FileResponse> {
    throw new NotImplementedException();
  }

  @GrpcMethod(FILE_SERVICE_NAME, 'DeleteFile')
  async deleteFile(_request: DeleteFileRequest): Promise<EmptyResponse> {
    throw new NotImplementedException();
  }
}
