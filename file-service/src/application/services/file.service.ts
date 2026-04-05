/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { Inject, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { FileEntity, FileStatus } from '../../domain/entities/file.entity.js';
import { Observable } from 'rxjs';
import { S3Service } from '../../infrastructure/s3/s3.service.js';
import * as FilePort from '../../domain/ports/file.repository.js';
import { UploadFileRequest } from '@clement.pasteau/contracts';

interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
}

type UploadFileRuntimeRequest = UploadFileRequest & {
  metadata?: FileMetadata;
  chunk?: Uint8Array;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toFileMetadata = (value: unknown): FileMetadata | null => {
  if (!isObjectRecord(value)) {
    return null;
  }
  const originalName = value.originalName;
  const mimeType = value.mimeType;
  const rawSize = value.size;
  if (typeof originalName !== 'string' || typeof mimeType !== 'string') {
    return null;
  }
  const size =
    typeof rawSize === 'number'
      ? rawSize
      : typeof rawSize === 'string'
        ? Number.parseInt(rawSize, 10)
        : NaN;
  if (!Number.isFinite(size) || size < 0) {
    return null;
  }
  return {
    originalName,
    mimeType,
    size,
  };
};

const isChunk = (value: unknown): value is Uint8Array => value instanceof Uint8Array;

@Injectable()
export class FileService {
  constructor(
    private readonly s3Service: S3Service,
    @Inject(FilePort.FILE_REPOSITORY)
    private readonly fileRepository: FilePort.IFileRepository,
  ) {}

  async uploadFile(userId: string, request$: Observable<UploadFileRequest>): Promise<FileEntity> {
    let metadata: FileMetadata | null = null;
    const chunks: Uint8Array[] = [];
    let totalSize = 0;
    let isProcessing = false;

    const processUpload = async (_source: 'complete' | 'size-match'): Promise<FileEntity> => {
      const totalBytesReceived = chunks.reduce((sum, c) => sum + c.length, 0);

      if (!metadata) {
        throw new Error('File metadata is missing in the upload stream');
      }

      if (totalBytesReceived !== metadata.size) {
        Logger.warn(
          `Size mismatch: received ${totalBytesReceived} bytes but metadata.size is ${metadata.size}`,
        );
      }

      const buffer = Buffer.concat(chunks);
      const fileEntity = new FileEntity();
      fileEntity.userId = userId;
      fileEntity.originalName = metadata.originalName;
      fileEntity.mimeType = metadata.mimeType;
      fileEntity.size = metadata.size;
      fileEntity.status = FileStatus.UPLOADING;
      fileEntity.minioKey = `${userId}-${Date.now()}/${metadata.originalName}`;

      const savedFile = await this.fileRepository.save(fileEntity);
      Logger.debug(`File metadata saved with ID: ${savedFile.id}, starting S3 upload...`);
      try {
        await this.s3Service.putObject(fileEntity.minioKey, buffer, fileEntity.mimeType);
        savedFile.status = FileStatus.COMPLETED;
        await this.fileRepository.save(savedFile);
        return savedFile;
      } catch (error: unknown) {
        savedFile.status = FileStatus.FAILED;
        await this.fileRepository.save(savedFile);
        if (error instanceof Error) {
          Logger.error(`Error uploading file ${fileEntity.minioKey} to S3: ${error.message}`);
        } else {
          Logger.error(`Error uploading file ${fileEntity.minioKey} to S3:`, error);
        }
        throw error instanceof Error ? error : new Error('Unknown error during S3 upload');
      }
    };

    return new Promise<FileEntity>((resolve, reject) => {
      request$.subscribe({
        next: (req: UploadFileRuntimeRequest) => {
          let metadataPayload: FileMetadata | undefined;
          let chunkPayload: Uint8Array | undefined;

          const topLevelMetadata = toFileMetadata(req.metadata);
          if (topLevelMetadata) {
            metadataPayload = topLevelMetadata;
          }
          if (isChunk(req.chunk)) {
            chunkPayload = req.chunk;
          }

          const requestField = (req as Record<string, unknown>).request;
          if ((!metadataPayload || !chunkPayload) && isObjectRecord(requestField)) {
            const nestedMetadata = toFileMetadata(requestField.metadata);
            if (!metadataPayload && nestedMetadata) {
              metadataPayload = nestedMetadata;
            }
            if (!chunkPayload && isChunk(requestField.chunk)) {
              chunkPayload = requestField.chunk;
            }
          }

          if (metadataPayload) {
            Logger.debug('Metadata received: ' + JSON.stringify(metadataPayload));
            metadata = metadataPayload;
          } else if (chunkPayload) {
            Logger.debug('Chunk received of size: ' + chunkPayload.length);
            chunks.push(new Uint8Array(chunkPayload));
            totalSize += chunkPayload.length;

            if (metadata && totalSize >= metadata.size && !isProcessing) {
              isProcessing = true;
              Logger.debug(
                `All bytes received (${totalSize}/${metadata.size}). Triggering upload processing.`,
              );
              processUpload('size-match').then(resolve).catch(reject);
            }
          } else {
            Logger.warn(
              'Upload message ignored: neither metadata nor chunk payload was recognized',
            );
          }
        },
        error: (err) => {
          if (isProcessing) {
            return;
          }
          Logger.error(
            `Error receiving file upload stream: ${err instanceof Error ? err.message : err}`,
          );
          reject(err instanceof Error ? err : new Error('Unknown error during file upload'));
        },
        complete: () => {
          if (isProcessing) {
            return;
          }
          isProcessing = true;
          processUpload('complete')
            .then(resolve)
            .catch((err: unknown) => {
              if (err instanceof Error) {
                Logger.error(`Error processing upload: ${err.message}`, err.stack);
                reject(err);
              } else {
                Logger.error('Unknown error during upload processing', err);
                reject(new Error('Unknown error during upload processing'));
              }
            });
        },
      });
    });
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
