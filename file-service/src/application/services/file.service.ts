/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { Injectable, NotImplementedException } from '@nestjs/common';
import { FileEntity } from '../../domain/entities/file.entity.js';
import { Observable } from 'rxjs';

@Injectable()
export class FileService {
  async uploadFile(
    _userId: string,
    _originalName: string,
    _mimeType: string,
    _size: number,
    _chunks: Observable<Uint8Array>,
  ): Promise<FileEntity> {
    throw new NotImplementedException();
  }

  async getFile(_id: string): Promise<FileEntity> {
    throw new NotImplementedException();
  }

  async getUserFiles(_userId: string): Promise<FileEntity[]> {
    throw new NotImplementedException();
  }

  async deleteFile(_id: string): Promise<void> {
    throw new NotImplementedException();
  }
}
