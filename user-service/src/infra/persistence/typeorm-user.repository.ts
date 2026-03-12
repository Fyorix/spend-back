import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IUserRepository } from 'src/core/port/user.repository';
import { UserEntity } from 'src/core/entities/user.entity';
import { Repository } from 'typeorm';
import { UserModel } from '../models/user.model';

@Injectable()
export class TypeormUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly baseRepo: Repository<UserModel>,
  ) {}
  findByEmail(email: string): Promise<UserEntity | null> {
    return this.baseRepo.findOne({ where: { email } });
  }
  findById(id: string): Promise<UserEntity | null> {
    return this.baseRepo.findOne({ where: { id } });
  }
  save(user: UserEntity): Promise<void> {
    this.baseRepo.save(user);
    return Promise.resolve();
  }
  delete(id: string): Promise<void> {
    this.baseRepo.delete({ id });
    return Promise.resolve();
  }
}
