import { useEffect, useState } from 'react';
import { CardTile } from '../../components/CardTile';
import type { CharacterStack } from '../../lib/catalog/characterStacks';
import { stackCardsInAddOrder } from '../../lib/catalog/characterStacks';

export interface CharacterStackRowProps {
  stack: CharacterStack;
  inDeckCount: number;
  totalCount: number;
  onAddStack: () => void;
}

export function CharacterStackRow({
  stack,
  inDeckCount,
  totalCount,
  onAddStack,
}: CharacterStackRowProps) {
  const [addedFlash, setAddedFlash] = useState(false);
  const isComplete = inDeckCount >= totalCount && totalCount > 0;

  useEffect(() => {
    if (!addedFlash) return undefined;
    const t = setTimeout(() => setAddedFlash(false), 1500);
    return () => clearTimeout(t);
  }, [addedFlash]);

  const handleAdd = () => {
    if (isComplete) return;
    onAddStack();
    setAddedFlash(true);
  };

  const portraitCards = stackCardsInAddOrder(stack).filter(
    (entry) => entry.catalogType !== 'characters',
  );

  return (
    <button
      type="button"
      className={`add-cards__stack${addedFlash ? ' add-cards__stack--added' : ''}${isComplete ? ' add-cards__stack--complete' : ''}`}
      disabled={isComplete}
      aria-label={
        isComplete ? `In deck: ${stack.characterName}` : `Add ${stack.characterName} stack`
      }
      onClick={handleAdd}
    >
      <div className="add-cards__stack-character">
        <CardTile
          card={stack.character}
          catalogType="characters"
          showMeta={false}
        />
      </div>
      {portraitCards.length > 0 ? (
        <div className="add-cards__stack-portraits add-cards__grid add-cards__grid--portrait">
          {portraitCards.map(({ card, catalogType }) => (
            <CardTile
              key={`${catalogType}-${card.id}`}
              card={card}
              catalogType={catalogType}
              showMeta={false}
            />
          ))}
        </div>
      ) : null}
    </button>
  );
}
