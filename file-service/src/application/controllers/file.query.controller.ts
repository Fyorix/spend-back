/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, NotImplementedException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  FILE_SERVICE_NAME,
  type GetFileRequest,
  type FileResponse,
  type GetUserFilesRequest,
  type FileListResponse,
} from '@clement.pasteau/contracts';
@Controller()
export class FileQueryController {
  constructor() {}

  @GrpcMethod(FILE_SERVICE_NAME, 'GetFile')
  async getFile(_request: GetFileRequest): Promise<FileResponse> {
    throw new NotImplementedException();
  }

  @GrpcMethod(FILE_SERVICE_NAME, 'GetUserFiles')
  async getUserFiles(_request: GetUserFilesRequest): Promise<FileListResponse> {
    throw new NotImplementedException();
  }
}
