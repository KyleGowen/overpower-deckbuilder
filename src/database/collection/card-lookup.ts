import { PoolClient } from 'pg';
import { CATALOG_CARD_TABLE } from '../card/catalog-card-tables';
import { resolveSetDisplayName } from '../setsLookup';

// Pre-built query strings (table names from allowlist only; no interpolation at query call site).
const QUERY_IMAGE_PATH: Record<string, string> = {};
const QUERY_EXISTS: Record<string, string> = {};
const QUERY_FETCH_CARD: Record<string, string> = {};
for (const [type, table] of Object.entries(CATALOG_CARD_TABLE)) {
  QUERY_IMAGE_PATH[type] = `SELECT image_path FROM ${table} WHERE id = $1`;
  QUERY_EXISTS[type] = `SELECT 1 FROM ${table} WHERE id = $1`;
  QUERY_FETCH_CARD[type] = `SELECT * FROM ${table} WHERE id = $1`;
}

/**
 * Get image path from card data.
 * After migration, alternate cards are separate cards, so we just get the card's image_path.
 */
export async function getCardImagePath(
  client: PoolClient,
  cardId: string,
  cardType: string
): Promise<string> {
  const query = QUERY_IMAGE_PATH[cardType];
  let cardImagePath: string | null = null;

  if (query) {
    try {
      const result = await client.query(query, [cardId]);
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
  const query = QUERY_EXISTS[cardType];
  if (!query) {
    return false;
  }
  const result = await client.query(query, [cardId]);
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
  cardType: string,
  setNameCache?: Map<string, string>
): Promise<FetchCardDataResult> {
  const query = QUERY_FETCH_CARD[cardType];
  const out: FetchCardDataResult = { cardData: null, cardName: '', set: 'ERB' };

  if (!query) {
    return out;
  }

  try {
    const result = await client.query(query, [cardId]);
    if (result.rows.length === 0) {
      return out;
    }
    const row = result.rows[0] as Record<string, unknown>;
    out.cardData = row;
    const rawSet = (row.set as string) || 'ERB';
    out.set = await resolveSetDisplayName(client, rawSet, setNameCache);

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
