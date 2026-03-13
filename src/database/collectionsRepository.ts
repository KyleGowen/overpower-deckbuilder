import { Pool } from 'pg';
import {
  createCollectionRepositoryContext,
  type CollectionRepositoryContext,
} from './collection/context';
import type { Collection, CollectionCard, CollectionCardWithDetails, CollectionHistory } from './collection/types';
import * as collectionCrud from './collection/collection-crud';
import * as collectionCards from './collection/collection-cards';
import * as collectionHistory from './collection/collection-history';
import * as cardLookup from './collection/card-lookup';

export type { Collection, CollectionCard, CollectionCardWithDetails, CollectionHistory };

export class CollectionsRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getContext(): CollectionRepositoryContext {
    return createCollectionRepositoryContext(this.pool);
  }

  async getOrCreateCollection(userId: string): Promise<string> {
    return collectionCrud.getOrCreateCollection(this.getContext(), userId);
  }

  async getCollectionCards(collectionId: string): Promise<CollectionCardWithDetails[]> {
    return collectionCards.getCollectionCards(this.getContext(), collectionId);
  }

  async addCardToCollection(
    collectionId: string,
    cardId: string,
    cardType: string,
    quantity: number = 1,
    imagePath?: string
  ): Promise<CollectionCard> {
    return collectionCards.addCardToCollection(
      this.getContext(),
      collectionId,
      cardId,
      cardType,
      quantity,
      imagePath
    );
  }

  async updateCardQuantity(
    collectionId: string,
    cardId: string,
    cardType: string,
    quantity: number,
    imagePath: string,
    oldImagePath?: string
  ): Promise<CollectionCard | null> {
    return collectionCards.updateCardQuantity(
      this.getContext(),
      collectionId,
      cardId,
      cardType,
      quantity,
      imagePath,
      oldImagePath
    );
  }

  async getQuantity(
    collectionId: string,
    cardId: string,
    cardType: string,
    imagePath: string
  ): Promise<number> {
    return collectionCards.getQuantity(
      this.getContext(),
      collectionId,
      cardId,
      cardType,
      imagePath
    );
  }

  async removeCardFromCollection(
    collectionId: string,
    cardId: string,
    cardType: string
  ): Promise<boolean> {
    return collectionCards.removeCardFromCollection(
      this.getContext(),
      collectionId,
      cardId,
      cardType
    );
  }

  async getCollectionHistory(collectionId: string, limit?: number): Promise<CollectionHistory[]> {
    return collectionHistory.getCollectionHistory(this.getContext(), collectionId, limit);
  }

  async verifyCardExists(cardId: string, cardType: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      return await cardLookup.verifyCardExists(client, cardId, cardType);
    } finally {
      client.release();
    }
  }
}
