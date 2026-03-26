import { EventTag } from '@clement.pasteau/shared';

export interface NearbyTransaction {
  transactionId: string;
  latitude: number;
  longitude: number;
  amount: number;
  tag: EventTag;
}
