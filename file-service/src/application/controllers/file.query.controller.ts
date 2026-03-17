/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, Logger, NotImplementedException } from '@nestjs/common';
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
  constructor() { }

  @GrpcMethod(FILE_SERVICE_NAME, 'GetFile')
  async getFile(_request: GetFileRequest): Promise<FileResponse> {
    Logger.log('GET FILE NOT IMPLEMENTED');
    throw new NotImplementedException();
  }

  @GrpcMethod(FILE_SERVICE_NAME, 'GetUserFiles')
  async getUserFiles(_request: GetUserFilesRequest): Promise<FileListResponse> {
    Logger.log('GET USER FILES NOT IMPLEMENTED');
    throw new NotImplementedException();
  }
}
