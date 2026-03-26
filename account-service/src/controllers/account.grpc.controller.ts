import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  type AccountServiceController,
  AccountServiceControllerMethods,
  type CreateTransactionRequest,
  type TransactionResponse,
  type ListTransactionsRequest,
  type ListTransactionsResponse,
  ACCOUNT_SERVICE_NAME,
} from '@clement.pasteau/contracts';
import { TransactionService } from '../core/services/transaction.service.js';

@Controller()
@AccountServiceControllerMethods()
export class AccountGrpcController implements AccountServiceController {
  constructor(private readonly transactionService: TransactionService) {}

  @GrpcMethod(ACCOUNT_SERVICE_NAME, 'CreateTransaction')
  async createTransaction(request: CreateTransactionRequest): Promise<TransactionResponse> {
    const transaction = await this.transactionService.createTransaction(request);
    return {
      id: transaction.id,
      name: transaction.name,
      price: transaction.price,
      tag: transaction.tag,
      userId: transaction.userId,
      createdAt: transaction.createdAt,
    };
  }

  @GrpcMethod(ACCOUNT_SERVICE_NAME, 'GetTransactions')
  async getTransactions(request: ListTransactionsRequest): Promise<ListTransactionsResponse> {
    const transactions = await this.transactionService.getTransactionsByUserId(request.userId);
    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
        tag: t.tag,
        userId: t.userId,
        createdAt: t.createdAt,
      })),
    };
  }
}
