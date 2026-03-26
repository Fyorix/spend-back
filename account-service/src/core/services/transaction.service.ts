import { Injectable, Inject } from '@nestjs/common';
import { type CreateTransactionRequest } from '@clement.pasteau/contracts';
import { type ITransactionRepository } from '../port/transaction.repository.js';
import { TransactionEntity } from '../entities/transaction.entity.js';
import { RedisPubService } from '../../infra/redis/redis-pub.service.js';
import {
  AccountEventAccountType,
  EventTag,
  type TransactionCreatedEvent,
} from '@clement.pasteau/shared';

@Injectable()
export class TransactionService {
  private readonly ACCOUNT_EVENTS_CHANNEL = 'account_events';

  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private readonly transactionRepository: ITransactionRepository,
    private readonly redisPubService: RedisPubService,
  ) {}

  async createTransaction(request: CreateTransactionRequest): Promise<TransactionEntity> {
    const transaction: TransactionEntity = new TransactionEntity();
    transaction.id = crypto.randomUUID();
    transaction.name = request.name;
    transaction.price = request.price;
    transaction.tag = request.tag;
    transaction.userId = request.userId;
    transaction.createdAt = new Date().toISOString();

    const savedTransaction = await this.transactionRepository.save(transaction);

    if (request.address) {
      const event: TransactionCreatedEvent = {
        type: AccountEventAccountType.TRANSACTION_CREATED,
        payload: {
          transactionId: savedTransaction.id,
          address: request.address,
          amount: savedTransaction.price,
          userId: savedTransaction.userId,
          tag: request.tag as unknown as EventTag,
        },
      };
      await this.redisPubService.publish(this.ACCOUNT_EVENTS_CHANNEL, event);
    }

    await this.redisPubService.publish(this.ACCOUNT_EVENTS_CHANNEL, {
      type: AccountEventAccountType.ACCOUNT_CREATED,
      payload: savedTransaction,
    });

    return savedTransaction;
  }

  async getTransactionsByUserId(userId: string): Promise<TransactionEntity[]> {
    return this.transactionRepository.findAllByUserId(userId);
  }
}
