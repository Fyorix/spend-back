/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotImplementedException } from '@nestjs/common';
import { FileEntity } from '../../domain/entities/file.entity.js';
import { FileModel } from '../models/file.model.js';

export class FileMapper {
  /**
   * TODO: Implement mapping logic between FileEntity and FileModel
   */
  static toEntity(_model: FileModel): FileEntity {
    // return new FileEntity(...)
    throw new NotImplementedException();
  }

  static toModel(_entity: FileEntity): FileModel {
    // const model = new FileModel()
    // ...
    throw new NotImplementedException();
  }
}
