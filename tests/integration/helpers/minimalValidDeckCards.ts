import type { Pool } from 'pg';

export type MinimalDeckCardInput = { type: string; cardId: string; quantity: number };

/** Real catalog IDs for a minimal Venture-legal deck (4 characters, 7 missions, 51 draw-pile power). */
export async function fetchMinimalValidDeckCards(pool: Pool): Promise<MinimalDeckCardInput[]> {
  const missionSetResult = await pool.query<{ mission_set: string }>(
    `SELECT mission_set FROM missions
     WHERE mission_set IS NOT NULL AND mission_set <> ''
     GROUP BY mission_set
     HAVING COUNT(*) >= 7
     ORDER BY mission_set
     LIMIT 1`
  );
  if (missionSetResult.rows.length === 0) {
    throw new Error('No mission set with 7+ missions for minimal valid deck IT fixture');
  }
  const missionSet = missionSetResult.rows[0].mission_set;

  const [chars, missions, repeatablePower] = await Promise.all([
    pool.query<{ id: string }>(
      `SELECT id FROM characters
       ORDER BY COALESCE(threat_level, 0) ASC, id
       LIMIT 4`
    ),
    pool.query<{ id: string }>(
      `SELECT id FROM missions WHERE mission_set = $1 ORDER BY id LIMIT 7`,
      [missionSet]
    ),
    pool.query<{ id: string }>(
      `SELECT id FROM power_cards
       WHERE one_per_deck = false
       ORDER BY value ASC NULLS LAST, id
       LIMIT 1`
    ),
  ]);

  if (chars.rows.length < 4 || missions.rows.length < 7) {
    throw new Error('Insufficient catalog data for minimal valid deck IT fixture');
  }

  const powerId = repeatablePower.rows[0]?.id;
  if (!powerId) {
    throw new Error('No repeatable power cards in catalog for minimal valid deck IT fixture');
  }

  return [
    ...chars.rows.map((r) => ({ type: 'character', cardId: r.id, quantity: 1 })),
    ...missions.rows.map((r) => ({ type: 'mission', cardId: r.id, quantity: 1 })),
    { type: 'power', cardId: powerId, quantity: 51 },
  ];
}

async function resolveMissionSetAndPowerId(pool: Pool): Promise<{ missionSet: string; powerId: string }> {
  const missionSetResult = await pool.query<{ mission_set: string }>(
    `SELECT mission_set FROM missions
     WHERE mission_set IS NOT NULL AND mission_set <> ''
     GROUP BY mission_set
     HAVING COUNT(*) >= 7
     ORDER BY mission_set
     LIMIT 1`
  );
  if (missionSetResult.rows.length === 0) {
    throw new Error('No mission set with 7+ missions for minimal valid deck IT fixture');
  }
  const missionSet = missionSetResult.rows[0].mission_set;

  const multiPower = await pool.query<{ id: string }>(
    `SELECT id FROM power_cards
     WHERE one_per_deck = false
     ORDER BY value ASC NULLS LAST, id
     LIMIT 1`
  );
  const fallbackPower = await pool.query<{ id: string }>(
    `SELECT id FROM power_cards ORDER BY value ASC NULLS LAST, id LIMIT 1`
  );
  const powerId = multiPower.rows[0]?.id ?? fallbackPower.rows[0]?.id;
  if (!powerId) {
    throw new Error('No power cards in catalog for minimal valid deck IT fixture');
  }
  return { missionSet, powerId };
}

/** Venture-legal deck with one event (56-card draw pile). */
export async function fetchMinimalValidDeckWithEvent(pool: Pool): Promise<MinimalDeckCardInput[]> {
  const base = await fetchMinimalValidDeckCards(pool);
  const { missionSet, powerId } = await resolveMissionSetAndPowerId(pool);
  const eventResult = await pool.query<{ id: string }>(
    `SELECT id FROM events WHERE mission_set = $1 ORDER BY id LIMIT 1`,
    [missionSet]
  );
  if (eventResult.rows.length === 0) {
    throw new Error(`No event for mission set ${missionSet}`);
  }
  const structural = base.filter((c) => c.type === 'character' || c.type === 'mission');
  return [
    ...structural,
    { type: 'event', cardId: eventResult.rows[0].id, quantity: 1 },
    { type: 'power', cardId: powerId, quantity: 55 },
  ];
}

/** Venture-legal deck with one location (51-card draw pile). */
export async function fetchMinimalValidDeckWithLocation(pool: Pool): Promise<MinimalDeckCardInput[]> {
  const base = await fetchMinimalValidDeckCards(pool);
  const locationResult = await pool.query<{ id: string }>(
    `SELECT id FROM locations ORDER BY id LIMIT 1`
  );
  if (locationResult.rows.length === 0) {
    throw new Error('No locations in catalog for minimal valid deck IT fixture');
  }
  const withoutPower = base.filter((c) => c.type !== 'power');
  const powerEntry = base.find((c) => c.type === 'power');
  if (!powerEntry) {
    throw new Error('Missing power entry in base minimal deck');
  }
  return [
    ...withoutPower,
    { type: 'location', cardId: locationResult.rows[0].id, quantity: 1 },
    powerEntry,
  ];
}
