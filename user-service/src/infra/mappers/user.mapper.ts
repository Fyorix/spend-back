import { UserEntity } from 'src/core/entities/user.entity';
import { UserModel } from '../models/user.model';

export class UserMapper {
  public static toDomain(model: UserModel): UserEntity {
    return {
      id: model.id,
      email: model.email,
      password: model.password,
    };
  }
  public static toPersistence(entity: UserEntity): Partial<UserModel> {
    return {
      email: entity.email,
      password: entity.password,
    };
  }
}
