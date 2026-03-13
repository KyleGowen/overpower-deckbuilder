import { PoolClient } from 'pg';

const CARD_TABLE_BY_TYPE: Record<string, string> = {
  character: 'characters',
  special: 'special_cards',
  power: 'power_cards',
  location: 'locations',
  mission: 'missions',
  event: 'events',
  aspect: 'aspects',
  advanced_universe: 'advanced_universe_cards',
  teamwork: 'teamwork_cards',
  ally_universe: 'ally_universe_cards',
  training: 'training_cards',
  basic_universe: 'basic_universe_cards',
};

/**
 * Get image path from card data.
 * After migration, alternate cards are separate cards, so we just get the card's image_path.
 */
export async function getCardImagePath(
  client: PoolClient,
  cardId: string,
  cardType: string
): Promise<string> {
  const table = CARD_TABLE_BY_TYPE[cardType];
  let cardImagePath: string | null = null;

  if (table) {
    try {
      const result = await client.query(
        `SELECT image_path FROM ${table} WHERE id = $1`,
        [cardId]
      );
      if (result.rows.length > 0) {
        cardImagePath = result.rows[0].image_path;
      }
    } catch (error) {
      console.error(`Error fetching card image_path for ${cardType} ${cardId}:`, error);
    }
  }

  if (cardImagePath && cardImagePath.trim() !== '') {
    const path = cardImagePath.trim();

    if (path.startsWith('/src/resources/cards/images/')) {
      if (cardType === 'location' && path.includes('/alternate/') && !path.includes('/locations/alternate/')) {
        return path.replace('/images/alternate/', '/images/locations/alternate/');
      }
      return path;
    }

    let fullPath = path;
    if (cardType === 'location' && path.startsWith('alternate/') && !path.startsWith('locations/')) {
      fullPath = 'locations/' + path;
    }
    return `/src/resources/cards/images/${fullPath}`;
  }

  return '/src/resources/cards/images/placeholder.webp';
}

/**
 * Verify that a card exists in the specified table.
 */
export async function verifyCardExists(
  client: PoolClient,
  cardId: string,
  cardType: string
): Promise<boolean> {
  const table = CARD_TABLE_BY_TYPE[cardType];
  if (!table) {
    return false;
  }
  const result = await client.query(`SELECT 1 FROM ${table} WHERE id = $1`, [cardId]);
  return result.rows.length > 0;
}

export interface FetchCardDataResult {
  cardData: Record<string, unknown> | null;
  cardName: string;
  set: string;
}

/**
 * Fetch full card row and normalized cardName/set for a collection card.
 */
export async function fetchCardDataForCollectionCard(
  client: PoolClient,
  cardId: string,
  cardType: string
): Promise<FetchCardDataResult> {
  const table = CARD_TABLE_BY_TYPE[cardType];
  const out: FetchCardDataResult = { cardData: null, cardName: '', set: 'ERB' };

  if (!table) {
    return out;
  }

  try {
    const result = await client.query(`SELECT * FROM ${table} WHERE id = $1`, [cardId]);
    if (result.rows.length === 0) {
      return out;
    }
    const row = result.rows[0] as Record<string, unknown>;
    out.cardData = row;
    out.set = (row.set as string) || 'ERB';

    switch (cardType) {
      case 'power':
        out.cardName = `${row.value} - ${row.power_type}`;
        break;
      case 'mission':
      case 'aspect':
      case 'advanced_universe':
      case 'ally_universe':
      case 'training':
      case 'basic_universe':
        out.cardName = (row.card_name as string) || (row.name as string) || '';
        break;
      case 'teamwork':
        out.cardName = (row.card_type as string) || (row.name as string) || '';
        break;
      default:
        out.cardName = (row.name as string) || '';
    }
  } catch (error) {
    console.error(`Error fetching card data for ${cardType} ${cardId}:`, error);
  }

  return out;
}
