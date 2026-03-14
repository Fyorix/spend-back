import { UserEntity } from 'src/core/entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<void>;
  deleteById(id: string): Promise<void>;
}
