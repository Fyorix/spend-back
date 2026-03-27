/* eslint-disable @typescript-eslint/no-unused-vars */
import { FileEntity } from '../../domain/entities/file.entity.js';
import { FileModel } from '../models/file.model.js';

export class FileMapper {
  static toEntity(model: FileModel): FileEntity {
    return {
      id: model.id,
      userId: model.userId,
      originalName: model.originalName,
      minioKey: model.minioKey,
      mimeType: model.mimeType,
      size: model.size,
      status: model.status as FileEntity['status'],
    };
  }

  static toModel(entity: FileEntity): FileModel {
    const model = new FileModel();
    if (entity.id) {
      model.id = entity.id;
    }
    model.userId = entity.userId;
    model.originalName = entity.originalName;
    model.minioKey = entity.minioKey;
    model.mimeType = entity.mimeType;
    model.size = entity.size;
    model.status = entity.status ?? '';
    return model;
  }
}
