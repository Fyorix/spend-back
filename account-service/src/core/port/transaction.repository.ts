import { TransactionEntity } from '../entities/transaction.entity.js';

export interface ITransactionRepository {
  save(transaction: TransactionEntity): Promise<TransactionEntity>;
  findAllByUserId(userId: string): Promise<TransactionEntity[]>;
}
