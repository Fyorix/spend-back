import {
  Repository,
  ObjectLiteral,
  DeleteResult,
  FindOptionsWhere,
  DeepPartial,
} from 'typeorm';

export abstract class BaseTypeOrmRepository<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async persist(entity: DeepPartial<T>): Promise<T> {
    return this.repository.save(entity);
  }

  async findOne(id: string): Promise<T | null> {
    const options = { where: { id } as unknown as FindOptionsWhere<T> };
    return this.repository.findOne(options);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async remove(id: string): Promise<DeleteResult> {
    return this.repository.delete(id);
  }

  async update(id: string, entity: DeepPartial<T>): Promise<T | null> {
    const existing = await this.findOne(id);
    if (!existing) {
      return null;
    }
    const updated = Object.assign(existing, entity);
    return this.repository.save(updated);
  }
}
