import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFileRepository } from '../../domain/ports/file.repository.js';
import { FileEntity } from '../../domain/entities/file.entity.js';
import { FileModel } from '../models/file.model.js';
import { FileMapper } from '../mappers/file.mapper.js';
import { BaseTypeOrmRepository } from './base-typeorm.repository.js';

@Injectable()
export class FileRepositoryImpl
  extends BaseTypeOrmRepository<FileModel>
  implements IFileRepository
{
  constructor(
    @InjectRepository(FileModel)
    repository: Repository<FileModel>,
  ) {
    super(repository);
  }

  async save(file: FileEntity): Promise<FileEntity> {
    const model = FileMapper.toModel(file);
    const saved = await this.persist(model);
    return FileMapper.toEntity(saved);
  }

  async findById(id: string): Promise<FileEntity | null> {
    const model = await this.findOne(id);
    return model ? FileMapper.toEntity(model) : null;
  }

  async findByUserId(userId: string): Promise<FileEntity[]> {
    const models = await this.repository.find({ where: { userId } });
    return models.map((model) => FileMapper.toEntity(model));
  }

  async delete(id: string): Promise<void> {
    await this.remove(id);
  }
}
