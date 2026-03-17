import { FileEntity } from '../entities/file.entity.js';

export interface IFileRepository {
  save(file: FileEntity): Promise<FileEntity>;
  findById(id: string): Promise<FileEntity | null>;
  findByUserId(userId: string): Promise<FileEntity[]>;
  delete(id: string): Promise<void>;
}

export const FILE_REPOSITORY = 'IFileRepository';
