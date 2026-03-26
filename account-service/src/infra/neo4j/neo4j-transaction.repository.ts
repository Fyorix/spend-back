import { Injectable, Inject } from '@nestjs/common';
import { type Driver } from 'neo4j-driver';
import { NEO4J_DRIVER } from './neo4j.module.js';
import { TransactionEntity } from '../../core/entities/transaction.entity.js';
import { ITransactionRepository } from '../../core/port/transaction.repository.js';
import { EventTag } from '@clement.pasteau/contracts';

@Injectable()
export class Neo4jTransactionRepository implements ITransactionRepository {
  constructor(@Inject(NEO4J_DRIVER) private readonly driver: Driver) { }

  async save(transaction: TransactionEntity): Promise<TransactionEntity> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MERGE (u:User {id: $userId})
        CREATE (t:Transaction {
          id: $id,
          name: $name,
          price: $price,
          tag: $tag,
          createdAt: $createdAt
        })
        CREATE (u)-[:HAS_TRANSACTION]->(t)
        return t
        `,
        {
          id: transaction.id || crypto.randomUUID(),
          name: transaction.name,
          price: transaction.price,
          tag: EventTag[transaction.tag] || transaction.tag.toString(),
          userId: transaction.userId,
          createdAt: transaction.createdAt || new Date().toISOString(),
        },
      );

      const record = result.records[0];
      const node = record.get('t');

      return {
        id: node.properties.id,
        name: node.properties.name,
        price: node.properties.price,
        tag: transaction.tag,
        userId: transaction.userId,
        createdAt: node.properties.createdAt,
      };
    } finally {
      await session.close();
    }
  }

  async findAllByUserId(userId: string): Promise<TransactionEntity[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u:User {id: $userId})-[:HAS_TRANSACTION]->(t:Transaction)
        RETURN t
        ORDER BY t.createdAt DESC
        `,
        { userId },
      );

      return result.records.map((record) => {
        const node = record.get('t');
        return {
          id: node.properties.id || '',
          name: node.properties.name || '',
          price: node.properties.price || 0,
          tag: node.properties.tag as any,
          userId: userId,
          createdAt: node.properties.createdAt || '',
        };
      });
    } finally {
      await session.close();
    }
  }
}
