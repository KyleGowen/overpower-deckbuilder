import { useEffect, useState, type ReactNode } from 'react';
import { CardTile } from '../../components/CardTile';
import type { CatalogCard } from '../../lib/api/types';
import type { MissionSet } from '../../lib/catalog/missionSets';
import { missionSetCardsInAddOrder } from '../../lib/catalog/missionSets';

export interface MissionSetRowProps {
  missionSet: MissionSet;
  qtyInDeck: (card: CatalogCard) => number;
  missionLimitReached: boolean;
  renderOverlay: (card: CatalogCard, inDeck: number) => ReactNode;
  onAddMission: (card: CatalogCard) => void;
  onAddSet: () => void;
}

export function MissionSetRow({
  missionSet,
  qtyInDeck,
  missionLimitReached,
  renderOverlay,
  onAddMission,
  onAddSet,
}: MissionSetRowProps) {
  const [addedFlash, setAddedFlash] = useState(false);

  const entries = missionSetCardsInAddOrder(missionSet);
  const inDeckCount = entries.filter(({ card }) => qtyInDeck(card) > 0).length;
  const isComplete = inDeckCount >= entries.length && entries.length > 0;
  const missingCount = entries.filter(({ card }) => qtyInDeck(card) === 0).length;
  const addSetDisabled = isComplete || missionLimitReached || missingCount === 0;

  useEffect(() => {
    if (!addedFlash) return undefined;
    const t = setTimeout(() => setAddedFlash(false), 1500);
    return () => clearTimeout(t);
  }, [addedFlash]);

  const handleAddSet = () => {
    if (addSetDisabled) return;
    onAddSet();
    setAddedFlash(true);
  };

  return (
    <div
      className={`add-cards__mission-set${addedFlash ? ' add-cards__mission-set--added' : ''}${isComplete ? ' add-cards__mission-set--complete' : ''}`}
    >
      <div className="add-cards__grid add-cards__grid--portrait-4">
        {missionSet.missions.map((card) => {
          const inDeck = qtyInDeck(card);
          return (
            <CardTile
              key={card.id}
              card={card}
              catalogType="missions"
              showMeta={false}
              onClick={() => onAddMission(card)}
              overlay={renderOverlay(card, inDeck)}
            />
          );
        })}
        <button
          type="button"
          className="add-cards__add-set"
          disabled={addSetDisabled}
          aria-label={
            isComplete
              ? `In deck: ${missionSet.missionSetName}`
              : missionLimitReached
                ? `Mission limit reached: ${missionSet.missionSetName}`
                : `Add set: ${missionSet.missionSetName}`
          }
          onClick={handleAddSet}
        >
          Add Set
        </button>
      </div>
    </div>
  );
}
