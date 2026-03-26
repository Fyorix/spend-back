import { EventTag } from '@clement.pasteau/contracts';

export class TransactionEntity {
  id!: string;
  name!: string;
  price!: number;
  tag!: EventTag;
  userId!: string;
  createdAt!: string;
}
