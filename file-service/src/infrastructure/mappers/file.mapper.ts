/* eslint-disable @typescript-eslint/no-unused-vars */
import { FileEntity } from '../../domain/entities/file.entity.js';
import { FileModel } from '../models/file.model.js';

export class FileMapper {
  static toEntity(_model: FileModel): FileEntity {
    return {
      id: _model.id,
      userId: _model.userId,
      originalName: _model.originalName,
      minioKey: _model.minioKey,
      mimeType: _model.mimeType,
      size: _model.size,
    };
  }

  static toModel(_entity: FileEntity): FileModel {
    const model = new FileModel();
    model.userId = _entity.userId;
    model.originalName = _entity.originalName;
    model.minioKey = _entity.minioKey;
    model.mimeType = _entity.mimeType;
    model.size = _entity.size;
    return model;
  }
}
