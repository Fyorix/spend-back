import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFileRepository } from '../../domain/ports/file.repository.js';
import { FileEntity } from '../../domain/entities/file.entity.js';
import { FileModel } from '../models/file.model.js';
import { FileMapper } from '../mappers/file.mapper.js';

@Injectable()
export class TypeOrmFileRepository implements IFileRepository {
  constructor(
    @InjectRepository(FileModel)
    private readonly baseRepository: Repository<FileModel>,
  ) {}

  async save(file: FileEntity): Promise<FileEntity> {
    const model = FileMapper.toModel(file);
    const saved = await this.baseRepository.save(model);
    return FileMapper.toEntity(saved);
  }

  async findById(id: string): Promise<FileEntity | null> {
    const model = await this.baseRepository.findOne({ where: { id } });
    return model ? FileMapper.toEntity(model) : null;
  }

  async findByUserId(userId: string): Promise<FileEntity[]> {
    const models = await this.baseRepository.find({ where: { userId } });
    return models.map((model) => FileMapper.toEntity(model));
  }

  async delete(id: string): Promise<void> {
    await this.baseRepository.delete(id);
  }
}
