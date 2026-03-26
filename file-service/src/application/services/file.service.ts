/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { FileEntity, FileStatus } from '../../domain/entities/file.entity.js';
import { Observable } from 'rxjs';
import { S3Service } from '../../infrastructure/s3/s3.service.js';
import * as FilePort from '../../domain/ports/file.repository.js';

@Injectable()
export class FileService {
  constructor(
    private readonly s3Service: S3Service,
    @Inject(FilePort.FILE_REPOSITORY)
    private readonly fileRepository: FilePort.IFileRepository,
  ) {}

  async uploadFile(
    userId: string,
    originalName: string,
    mimeType: string,
    size: number,
    chunks: Observable<Uint8Array>,
  ): Promise<FileEntity> {
    // Creation of the file entity with status PENDING
    const file = new FileEntity();
    file.userId = userId;
    file.originalName = originalName;
    file.mimeType = mimeType;
    file.size = size;
    file.status = FileStatus.UPLOADING;
    file.minioKey = `${userId}-${Date.now()}/${originalName}`;

    const savedFile = await this.fileRepository.save(file);
    try {
      const buffer = await new Promise<Buffer>((resolve, reject) => {
        const chunksArray: Uint8Array[] = [];
        chunks.subscribe({
          next: (chunk) => chunksArray.push(new Uint8Array(chunk)),
          error: (err) => reject(err as Error),
          complete: () => resolve(Buffer.concat(chunksArray)),
        });
      });
      await this.s3Service.putObject(savedFile.minioKey, buffer, mimeType);
      savedFile.status = FileStatus.COMPLETED;
      await this.fileRepository.save(savedFile);
      return savedFile;
    } catch (error) {
      savedFile.status = FileStatus.FAILED;
      await this.fileRepository.save(savedFile);
      throw error;
    }
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
