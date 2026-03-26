import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiProperty,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  ACCOUNT_SERVICE_NAME,
  type AccountServiceClient,
  type CreateTransactionRequest,
  type TransactionResponse,
  type ListTransactionsResponse,
  EventTag,
} from '@clement.pasteau/contracts';
import { firstValueFrom } from 'rxjs';

class CreateTransactionDto implements Omit<CreateTransactionRequest, 'userId'> {
  @ApiProperty({ example: 'Grocery shopping' })
  name!: string;

  @ApiProperty({ example: 45.5 })
  price!: number;

  @ApiProperty({ enum: EventTag, example: EventTag.FOOD })
  tag!: EventTag;

  @ApiProperty({ example: '123 Main St, New York, NY', required: false })
  address!: string;
}

@ApiTags('Transactions')
@Controller('transactions')
@ApiBearerAuth()
export class TransactionGatewayController implements OnModuleInit {
  private accountService!: AccountServiceClient;

  constructor(
    @Inject('ACCOUNT_PACKAGE') private readonly client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.accountService = this.client.getService<AccountServiceClient>(ACCOUNT_SERVICE_NAME);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  async createTransaction(
    @Req() req: any,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    return firstValueFrom(
      this.accountService.createTransaction({
        ...dto,
        userId: req.user.id,
        address: dto.address ?? '',
      }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions for current user' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async getTransactions(@Req() req: any): Promise<ListTransactionsResponse> {
    return firstValueFrom(
      this.accountService.getTransactions({
        userId: req.user.id,
      }),
    );
  }
}
