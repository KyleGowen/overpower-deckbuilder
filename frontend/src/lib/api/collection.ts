/** Collection APIs (logged-in users). GUEST collections are localStorage-only. */
import { api } from './client';
import type { CollectionCard, CollectionCardType } from './types';

export function fetchCollectionCards(signal?: AbortSignal): Promise<CollectionCard[]> {
  return api.get<CollectionCard[]>('/api/v1/collections/me/cards', signal);
}

export interface AddCollectionCardInput {
  cardId: string;
  cardType: CollectionCardType;
  quantity?: number;
  imagePath: string;
}

export function addCollectionCard(input: AddCollectionCardInput): Promise<CollectionCard> {
  return api.post<CollectionCard>('/api/v1/collections/me/cards', input);
}

export interface SetCollectionQuantityInput {
  cardId: string;
  cardType: CollectionCardType;
  quantity: number;
  imagePath: string;
  oldImagePath?: string;
}

export function setCollectionQuantity(
  input: SetCollectionQuantityInput,
): Promise<CollectionCard | null> {
  const { cardId, ...body } = input;
  return api.put<CollectionCard | null>(`/api/v1/collections/me/cards/${cardId}`, body);
}
