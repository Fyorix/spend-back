import { Inject, Injectable } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../port/user.repository.js';
import {
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../errors/index.js';
import { UserEntity } from '../entities/user.entity.js';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly usersRepository: IUserRepository,
  ) {}

  public async register(userEntity: UserEntity): Promise<void> {
    if (await this.usersRepository.findByEmail(userEntity.email)) {
      throw new UserAlreadyExistsException(userEntity.email);
    }
    await this.usersRepository.save(userEntity);
  }

  public async login(userEntity: UserEntity): Promise<void> {
    const user = await this.usersRepository.findByEmail(userEntity.email);
    if (!user) {
      throw new UserNotFoundException(userEntity.email);
    }
    if (user.password !== userEntity.password) {
      throw new InvalidCredentialsException('passwords differ');
    }
  }

  public async getUserById(id: string): Promise<UserEntity> {
    const user: UserEntity | null = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException('User not found');
    }
    return user;
  }

  public async deleteUserById(id: string): Promise<void> {
    const user: UserEntity | null = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException('User not found');
    }
    await this.usersRepository.deleteById(id);
  }
}
