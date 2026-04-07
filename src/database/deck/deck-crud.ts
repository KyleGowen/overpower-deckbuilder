import { Deck, DeckCard } from '../../types';
import type { DeckRepositoryContext } from './context';

/** Deck row from SELECT * FROM decks */
type DeckRow = Record<string, unknown>;

/** Deck list row with joined character/location/mission preview columns */
interface DeckListRow extends DeckRow {
  character_1_id?: string;
  character_1_name?: string;
  character_1_default_image?: string;
  character_1_is_foil?: boolean;
  character_2_id?: string;
  character_2_name?: string;
  character_2_default_image?: string;
  character_2_is_foil?: boolean;
  character_3_id?: string;
  character_3_name?: string;
  character_3_default_image?: string;
  character_3_is_foil?: boolean;
  character_4_id?: string;
  character_4_name?: string;
  character_4_default_image?: string;
  character_4_is_foil?: boolean;
  location_id?: string;
  location_name?: string;
  location_default_image?: string;
  mission_1_id?: string;
  mission_1_name?: string;
  mission_1_default_image?: string;
}

/** First mission preview in deck list (from LATERAL subquery aliases). */
const MISSION_LIST_SLOTS = [
  {
    idField: 'mission_1_id',
    nameField: 'mission_1_name',
    imageField: 'mission_1_default_image',
    syntheticIdPrefix: 'mission1',
  },
] as const;

interface DeckCardRow {
  id: string;
  card_type: string;
  card_id: string;
  quantity: number;
  exclude_from_draw?: boolean;
}

const CHARACTER_LIST_SLOTS = [
  {
    sqlAlias: 'c1',
    idField: 'character_1_id',
    nameField: 'character_1_name',
    imageField: 'character_1_default_image',
    foilField: 'character_1_is_foil',
    syntheticSuffix: '1',
  },
  {
    sqlAlias: 'c2',
    idField: 'character_2_id',
    nameField: 'character_2_name',
    imageField: 'character_2_default_image',
    foilField: 'character_2_is_foil',
    syntheticSuffix: '2',
  },
  {
    sqlAlias: 'c3',
    idField: 'character_3_id',
    nameField: 'character_3_name',
    imageField: 'character_3_default_image',
    foilField: 'character_3_is_foil',
    syntheticSuffix: '3',
  },
  {
    sqlAlias: 'c4',
    idField: 'character_4_id',
    nameField: 'character_4_name',
    imageField: 'character_4_default_image',
    foilField: 'character_4_is_foil',
    syntheticSuffix: '4',
  },
] as const;

function buildCharacterListSqlFragments(): { selectFragment: string; joinFragment: string } {
  const selectParts = CHARACTER_LIST_SLOTS.map(
    (s) =>
      `${s.sqlAlias}.name as ${s.nameField},
          ${s.sqlAlias}.image_path as ${s.imageField},
          ${s.sqlAlias}.is_foil as ${s.foilField}`,
  );
  const joinParts = CHARACTER_LIST_SLOTS.map(
    (s) => `LEFT JOIN characters ${s.sqlAlias} ON d.${s.idField} = ${s.sqlAlias}.id`,
  );
  return {
    selectFragment: selectParts.join(',\n          '),
    joinFragment: joinParts.map((j) => `        ${j}`).join('\n'),
  };
}

function pushCharacterPreviewCards(cards: DeckCard[], deckRow: DeckListRow): void {
  const deckId = deckRow.id as string;
  for (const slot of CHARACTER_LIST_SLOTS) {
    const cardId = deckRow[slot.idField];
    if (!cardId) {
      continue;
    }
    cards.push({
      id: `char${slot.syntheticSuffix}_${deckId}`,
      type: 'character',
      cardId,
      quantity: 1,
      ...(deckRow[slot.imageField] !== undefined && {
        defaultImage: deckRow[slot.imageField],
      }),
      ...(deckRow[slot.nameField] !== undefined && { name: deckRow[slot.nameField] }),
      is_foil: deckRow[slot.foilField] ?? false,
    });
  }
}

function pushMissionPreviewCards(cards: DeckCard[], deckRow: DeckListRow): void {
  const deckId = deckRow.id as string;
  for (const slot of MISSION_LIST_SLOTS) {
    const cardId = deckRow[slot.idField];
    if (!cardId) {
      continue;
    }
    cards.push({
      id: `${slot.syntheticIdPrefix}_${deckId}`,
      type: 'mission',
      cardId,
      quantity: 1,
      ...(deckRow[slot.imageField] !== undefined && {
        defaultImage: deckRow[slot.imageField],
      }),
      ...(deckRow[slot.nameField] !== undefined && { name: deckRow[slot.nameField] }),
    });
  }
}

export function mapDeckRowWithCards(deckRow: DeckRow, cards: DeckCard[]): Deck {
  const desc = deckRow.description as string | undefined;
  const uiPrefs = deckRow.ui_preferences as Deck['ui_preferences'] | undefined;
  const isLimited = deckRow.is_limited as boolean | undefined;
  const reserveChar = deckRow.reserve_character as string | undefined;
  const displayMission = (deckRow.display_mission_card_id as string | null) ?? null;
  const bgPath = deckRow.background_image_path as string | undefined;
  const threatVal = deckRow.threat as number | undefined;
  const createdAt = deckRow.created_at as string | undefined;
  const updatedAt = deckRow.updated_at as string | undefined;
  return {
    id: deckRow.id as string,
    user_id: deckRow.user_id as string,
    name: deckRow.name as string,
    ...(desc !== undefined && { description: desc }),
    ...(uiPrefs !== undefined && { ui_preferences: uiPrefs }),
    ...(isLimited !== undefined && { is_limited: isLimited }),
    ...(reserveChar !== undefined && { reserve_character: reserveChar }),
    ...(displayMission !== null && { display_mission_card_id: displayMission }),
    ...(bgPath !== undefined && { background_image_path: bgPath }),
    ...(threatVal !== undefined && { threat: threatVal }),
    ...(createdAt !== undefined && { created_at: createdAt }),
    ...(updatedAt !== undefined && { updated_at: updatedAt }),
    cards,
  };
}

export function mapDeckRowToListDeck(deckRow: DeckListRow): Deck {
  const cards: DeckCard[] = [];

  pushCharacterPreviewCards(cards, deckRow);

  if (deckRow.location_id) {
    cards.push({
      id: `loc_${deckRow.id}`,
      type: 'location',
      cardId: deckRow.location_id,
      quantity: 1,
      ...(deckRow.location_default_image !== undefined && {
        defaultImage: deckRow.location_default_image,
      }),
      ...(deckRow.location_name !== undefined && { name: deckRow.location_name }),
    });
  }
  pushMissionPreviewCards(cards, deckRow);

  const desc = deckRow.description as string | undefined;
  const uiPrefs = deckRow.ui_preferences as Deck['ui_preferences'] | undefined;
  const isLimited = deckRow.is_limited as boolean | undefined;
  const isValid = deckRow.is_valid as boolean | undefined;
  const cardCount = deckRow.card_count as number | undefined;
  const threatVal = deckRow.threat as number | undefined;
  const reserveChar = deckRow.reserve_character as string | undefined;
  const displayMission = (deckRow.display_mission_card_id as string | null) ?? null;
  const bgPath = deckRow.background_image_path as string | undefined;
  const createdAt = deckRow.created_at as string | undefined;
  const updatedAt = deckRow.updated_at as string | undefined;
  return {
    id: deckRow.id as string,
    user_id: deckRow.user_id as string,
    name: deckRow.name as string,
    ...(desc !== undefined && { description: desc }),
    ...(uiPrefs !== undefined && { ui_preferences: uiPrefs }),
    ...(isLimited !== undefined && { is_limited: isLimited }),
    ...(isValid !== undefined && { is_valid: isValid }),
    ...(cardCount !== undefined && { card_count: cardCount }),
    ...(threatVal !== undefined && { threat: threatVal }),
    ...(reserveChar !== undefined && { reserve_character: reserveChar }),
    ...(displayMission !== null && { display_mission_card_id: displayMission }),
    ...(bgPath !== undefined && { background_image_path: bgPath }),
    ...(createdAt !== undefined && { created_at: createdAt }),
    ...(updatedAt !== undefined && { updated_at: updatedAt }),
    cards,
  };
}

export function mapDeckRowBasic(deckRow: DeckRow): Deck {
  const desc = deckRow.description as string | undefined;
  const uiPrefs = deckRow.ui_preferences as Deck['ui_preferences'] | undefined;
  const isLimited = deckRow.is_limited as boolean | undefined;
  const isValid = deckRow.is_valid as boolean | undefined;
  const cardCount = deckRow.card_count as number | undefined;
  const threatVal = deckRow.threat as number | undefined;
  const reserveChar = deckRow.reserve_character as string | undefined;
  const displayMission = (deckRow.display_mission_card_id as string | null) ?? null;
  const bgPath = deckRow.background_image_path as string | undefined;
  const createdAt = deckRow.created_at as string | undefined;
  const updatedAt = deckRow.updated_at as string | undefined;
  return {
    id: deckRow.id as string,
    user_id: deckRow.user_id as string,
    name: deckRow.name as string,
    ...(desc !== undefined && { description: desc }),
    ...(uiPrefs !== undefined && { ui_preferences: uiPrefs }),
    ...(isLimited !== undefined && { is_limited: isLimited }),
    ...(isValid !== undefined && { is_valid: isValid }),
    ...(cardCount !== undefined && { card_count: cardCount }),
    ...(threatVal !== undefined && { threat: threatVal }),
    ...(reserveChar !== undefined && { reserve_character: reserveChar }),
    ...(displayMission !== null && { display_mission_card_id: displayMission }),
    ...(bgPath !== undefined && { background_image_path: bgPath }),
    ...(createdAt !== undefined && { created_at: createdAt }),
    ...(updatedAt !== undefined && { updated_at: updatedAt }),
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createDeck(
  ctx: DeckRepositoryContext,
  userId: string,
  name: string,
  description?: string,
  characterIds?: string[]
): Promise<Deck> {
  const client = await ctx.pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'INSERT INTO decks (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, description ?? null]
    );

    const deck = result.rows[0] as DeckRow;
    const deckId = deck.id as string;

    if (characterIds?.length) {
      for (const characterId of characterIds) {
        await client.query(
          'INSERT INTO deck_cards (deck_id, card_type, card_id, quantity) VALUES ($1, $2, $3, $4)',
          [deckId, 'character', characterId, 1]
        );
      }
    }

    await client.query('COMMIT');

    const updatedDeckResult = await client.query(
      'SELECT * FROM decks WHERE id = $1',
      [deckId]
    );
    const updatedDeck = updatedDeckResult.rows[0] as DeckRow;
    const newDeck = mapDeckRowBasic(updatedDeck);

    ctx.cache.set(deckId, { deck: newDeck, timestamp: Date.now() });
    ctx.cache.delete(`user_decks_${userId}`);

    return newDeck;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ PostgreSQLDeckRepository.createDeck error:', error);
    console.error('❌ CreateDeck error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      userId,
      deckName: name,
      description,
      characterIds,
    });
    throw error;
  } finally {
    client.release();
  }
}

export async function getDeckById(
  ctx: DeckRepositoryContext,
  id: string
): Promise<Deck | undefined> {
  if (!UUID_REGEX.test(id)) {
    return undefined;
  }

  const now = Date.now();
  const cached = ctx.cache.get(id);
  if (cached && now - cached.timestamp < ctx.cacheTtlMs) {
    return cached.deck as Deck;
  }

  const client = await ctx.pool.connect();
  try {
    const deckResult = await client.query(
      'SELECT * FROM decks WHERE id = $1',
      [id]
    );
    if (deckResult.rows.length === 0) {
      return undefined;
    }

    const deck = deckResult.rows[0] as DeckRow;
    const cardsResult = await client.query(
      'SELECT * FROM deck_cards WHERE deck_id = $1',
      [id]
    );
    const cards: DeckCard[] = (cardsResult.rows as DeckCardRow[]).map((card) => ({
      id: card.id,
      type: card.card_type as DeckCard['type'],
      cardId: card.card_id,
      quantity: card.quantity,
      exclude_from_draw: card.exclude_from_draw ?? false,
    }));

    const fullDeck = mapDeckRowWithCards(deck, cards);
    ctx.cache.set(id, { deck: fullDeck, timestamp: now });
    return fullDeck;
  } finally {
    client.release();
  }
}

export async function getDecksByUserId(
  ctx: DeckRepositoryContext,
  userId: string
): Promise<Deck[]> {
  const cacheKey = `user_decks_${userId}`;
  const now = Date.now();
  const cached = ctx.cache.get(cacheKey);
  if (cached && now - cached.timestamp < ctx.cacheTtlMs) {
    return cached.deck as Deck[];
  }

  const client = await ctx.pool.connect();
  try {
    const { selectFragment: characterSelectSql, joinFragment: characterJoinSql } =
      buildCharacterListSqlFragments();
    // SQL fragments from CHARACTER_LIST_SLOTS only (fixed aliases/columns); $1 is the only user input.
    const deckResult = await client.query( // nosemgrep: pg-sql-template-interpolation
      `
        SELECT 
          d.*,
          ${characterSelectSql},
          l.name as location_name,
          l.image_path as location_default_image,
          dm1.mission_id as mission_1_id,
          dm1.mission_name as mission_1_name,
          dm1.mission_image_path as mission_1_default_image
        FROM decks d
${characterJoinSql}
        LEFT JOIN locations l ON d.location_id = l.id
        LEFT JOIN LATERAL (
          SELECT 
            dc.card_id as mission_id,
            m.name as mission_name,
            m.image_path as mission_image_path
          FROM deck_cards dc
          JOIN missions m ON m.id = dc.card_id::uuid
          WHERE dc.deck_id = d.id AND dc.card_type = 'mission'
          ORDER BY
            CASE
              WHEN d.display_mission_card_id IS NOT NULL AND dc.card_id::uuid = d.display_mission_card_id THEN 0
              ELSE 1
            END,
            m.set_number_int ASC NULLS LAST,
            m.name ASC,
            dc.card_id ASC
          LIMIT 1
        ) dm1 ON true
        WHERE d.user_id = $1 
        ORDER BY d.created_at DESC
      `,
      [userId]
    );

    if (deckResult.rows.length === 0) {
      return [];
    }

    const decks = (deckResult.rows as DeckListRow[]).map(mapDeckRowToListDeck);
    ctx.cache.set(cacheKey, { deck: decks, timestamp: now });
    return decks;
  } finally {
    client.release();
  }
}

export async function getDeckSummaryWithAllCards(
  ctx: DeckRepositoryContext,
  deckId: string
): Promise<Deck | undefined> {
  const client = await ctx.pool.connect();
  try {
    const deckResult = await client.query(
      'SELECT * FROM decks WHERE id = $1',
      [deckId]
    );
    if (deckResult.rows.length === 0) {
      return undefined;
    }

    const deck = deckResult.rows[0] as DeckRow;
    const cardsResult = await client.query(
      'SELECT * FROM deck_cards WHERE deck_id = $1',
      [deckId]
    );
    const cards: DeckCard[] = (cardsResult.rows as DeckCardRow[]).map((card) => ({
      id: card.id,
      type: card.card_type as DeckCard['type'],
      cardId: card.card_id,
      quantity: card.quantity,
    }));

    const fullDeck = mapDeckRowWithCards(deck, cards);
    ctx.cache.set(deckId, { deck: fullDeck, timestamp: Date.now() });
    return fullDeck;
  } finally {
    client.release();
  }
}

export async function getAllDecks(ctx: DeckRepositoryContext): Promise<Deck[]> {
  const client = await ctx.pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM decks ORDER BY created_at'
    );
    return (result.rows as DeckRow[]).map(mapDeckRowBasic);
  } finally {
    client.release();
  }
}

export async function updateDeck(
  ctx: DeckRepositoryContext,
  id: string,
  updates: Partial<Deck>
): Promise<Deck | undefined> {
  const client = await ctx.pool.connect();
  try {
    const setClause: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      setClause.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClause.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.ui_preferences !== undefined) {
      setClause.push(`ui_preferences = $${paramCount++}`);
      values.push(JSON.stringify(updates.ui_preferences));
    }
    if (updates.is_limited !== undefined) {
      setClause.push(`is_limited = $${paramCount++}`);
      values.push(updates.is_limited);
    }
    if (updates.is_valid !== undefined) {
      setClause.push(`is_valid = $${paramCount++}`);
      values.push(updates.is_valid);
    }
    if (updates.reserve_character !== undefined) {
      setClause.push(`reserve_character = $${paramCount++}`);
      values.push(updates.reserve_character);
    }
    if (updates.display_mission_card_id !== undefined) {
      setClause.push(`display_mission_card_id = $${paramCount++}`);
      values.push(updates.display_mission_card_id);
    }
    if (updates.background_image_path !== undefined) {
      setClause.push(`background_image_path = $${paramCount++}`);
      values.push(updates.background_image_path);
    }

    if (setClause.length === 0) {
      return getDeckById(ctx, id);
    }

    setClause.push('updated_at = NOW()');
    values.push(id);

    // setClause is from a fixed whitelist of column assignments; values are parameterized.
    const result = await client.query( // nosemgrep: pg-sql-template-interpolation
      `UPDATE decks SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return undefined;
    }

    const deck = result.rows[0] as DeckRow;
    const updatedDeck = mapDeckRowBasic(deck);
    await ctx.invalidateDeck(id);
    return updatedDeck;
  } finally {
    client.release();
  }
}

export async function deleteDeck(
  ctx: DeckRepositoryContext,
  id: string
): Promise<boolean> {
  const client = await ctx.pool.connect();
  try {
    const userResult = await client.query(
      'SELECT user_id FROM decks WHERE id = $1',
      [id]
    );
    const userId = userResult.rows[0]?.user_id as string | undefined;

    const result = await client.query('DELETE FROM decks WHERE id = $1', [id]);
    const success = (result.rowCount ?? 0) > 0;

    if (success) {
      ctx.cache.delete(id);
      if (userId) {
        ctx.cache.delete(`user_decks_${userId}`);
      }
    }
    return success;
  } finally {
    client.release();
  }
}
