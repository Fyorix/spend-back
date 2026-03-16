import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IUserRepository } from 'src/core/port/user.repository';
import { UserEntity } from 'src/core/entities/user.entity';
import { Repository } from 'typeorm';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class TypeormUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly baseRepo: Repository<UserModel>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.baseRepo.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return UserMapper.toDomain(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.baseRepo.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    return UserMapper.toDomain(user);
  }

  async save(user: UserEntity): Promise<void> {
    await this.baseRepo.save(user);
  }

  async deleteById(id: string): Promise<void> {
    await this.baseRepo.delete(id);
  }
}
