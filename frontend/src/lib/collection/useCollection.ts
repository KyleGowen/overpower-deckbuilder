/**
 * Unified collection access for guest (localStorage) and logged-in (server)
 * users. Exposes owned quantities keyed by `${collectionType}:${cardId}` plus
 * a `setQuantity` mutator and aggregate totals.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/AuthProvider';
import { fetchCollectionCards, setCollectionQuantity, addCollectionCard } from '../api/collection';
import {
  getGuestCollection,
  setGuestQuantity,
} from './guestCollection';
import { cardDisplayName } from '../catalog/catalogTypeMap';
import type { CatalogCard, CollectionCardType } from '../api/types';

interface OwnedEntry {
  cardId: string;
  cardType: string;
  quantity: number;
  imagePath: string;
}

export interface UseCollectionResult {
  isGuest: boolean;
  isLoading: boolean;
  quantityFor: (cardId: string, collectionType: CollectionCardType) => number;
  setQuantity: (card: CatalogCard, collectionType: CollectionCardType, quantity: number) => Promise<void>;
  totalOwned: number;
  uniqueCards: number;
}

export function useCollection(): UseCollectionResult {
  const { isGuest } = useAuth();
  const queryClient = useQueryClient();
  const [guestTick, setGuestTick] = useState(0);

  const serverQuery = useQuery({
    queryKey: ['collection', 'me'],
    queryFn: () => fetchCollectionCards(),
    enabled: !isGuest,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!isGuest) return;
    const handler = () => setGuestTick((t) => t + 1);
    window.addEventListener('guest-collection-change', handler);
    return () => window.removeEventListener('guest-collection-change', handler);
  }, [isGuest]);

  const entries: OwnedEntry[] = useMemo(() => {
    if (isGuest) {
      void guestTick; // re-read localStorage when guest collection changes
      return getGuestCollection().map((e) => ({
        cardId: e.cardId,
        cardType: e.cardType,
        quantity: e.quantity,
        imagePath: e.imagePath,
      }));
    }
    return (serverQuery.data ?? []).map((c) => ({
      cardId: c.card_id,
      cardType: c.card_type,
      quantity: c.quantity,
      imagePath: c.image_path,
    }));
  }, [isGuest, guestTick, serverQuery.data]);

  const map = useMemo(() => {
    const m = new Map<string, number>();
    entries.forEach((e) => m.set(`${e.cardType}:${e.cardId}`, e.quantity));
    return m;
  }, [entries]);

  const quantityFor = useCallback(
    (cardId: string, collectionType: CollectionCardType) => map.get(`${collectionType}:${cardId}`) ?? 0,
    [map],
  );

  const setQuantity = useCallback(
    async (card: CatalogCard, collectionType: CollectionCardType, quantity: number) => {
      const imagePath = (card.image_path as string) || (card.image as string) || '';
      const next = Math.max(0, quantity);
      if (isGuest) {
        setGuestQuantity({
          cardId: card.id,
          cardType: collectionType,
          imagePath,
          quantity: next,
          cardName: cardDisplayName(card),
          set: card.set,
        });
        return;
      }
      // The PUT endpoint only updates cards already in the collection; a brand
      // new card must be POSTed first. Choose based on the currently-owned qty.
      const current = map.get(`${collectionType}:${card.id}`) ?? 0;
      if (current <= 0) {
        if (next <= 0) return;
        await addCollectionCard({ cardId: card.id, cardType: collectionType, quantity: next, imagePath });
      } else {
        await setCollectionQuantity({ cardId: card.id, cardType: collectionType, quantity: next, imagePath });
      }
      await queryClient.invalidateQueries({ queryKey: ['collection', 'me'] });
    },
    [isGuest, queryClient, map],
  );

  const totalOwned = useMemo(() => entries.reduce((s, e) => s + e.quantity, 0), [entries]);
  const uniqueCards = useMemo(() => entries.filter((e) => e.quantity > 0).length, [entries]);

  return {
    isGuest,
    isLoading: !isGuest && serverQuery.isLoading,
    quantityFor,
    setQuantity,
    totalOwned,
    uniqueCards,
  };
}
