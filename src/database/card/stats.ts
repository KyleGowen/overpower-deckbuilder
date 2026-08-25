import type { CardRepositoryContext } from './context';
import type { CardStats } from './context';

export async function getCardStats(ctx: CardRepositoryContext): Promise<CardStats> {
  const now = Date.now();
  if (
    ctx.cache.cardStats &&
    now - ctx.cache.cardStatsCacheTime < ctx.cardStatsCacheTtlMs
  ) {
    return ctx.cache.cardStats;
  }
  const client = await ctx.pool.connect();
  try {
    const result = await client.query(`
      SELECT
        'characters' as table_name, COUNT(*) as count FROM characters
      UNION ALL
      SELECT 'locations', COUNT(*) FROM locations
      UNION ALL
      SELECT 'battlegrounds', COUNT(*) FROM battlegrounds
      UNION ALL
      SELECT 'special_cards', COUNT(*) FROM special_cards
      UNION ALL
      SELECT 'missions', COUNT(*) FROM missions
      UNION ALL
      SELECT 'events', COUNT(*) FROM events
      UNION ALL
      SELECT 'aspects', COUNT(*) FROM aspects
      UNION ALL
      SELECT 'advanced_universe_cards', COUNT(*) FROM advanced_universe_cards
      UNION ALL
      SELECT 'teamwork_cards', COUNT(*) FROM teamwork_cards
      UNION ALL
      SELECT 'ally_universe_cards', COUNT(*) FROM ally_universe_cards
      UNION ALL
      SELECT 'training_cards', COUNT(*) FROM training_cards
      UNION ALL
      SELECT 'basic_universe_cards', COUNT(*) FROM basic_universe_cards
      UNION ALL
      SELECT 'power_cards', COUNT(*) FROM power_cards
    `);
    const stats = {} as CardStats;
    result.rows.forEach((row: { table_name: string; count: string }) => {
      const key = row.table_name.replace(/_/g, '').replace('cards', 'Cards');
      if (key === 'characters') stats.characters = parseInt(row.count, 10);
      else if (key === 'locations') stats.locations = parseInt(row.count, 10);
      else if (key === 'battlegrounds') stats.battlegrounds = parseInt(row.count, 10);
      else if (key === 'specialcards') stats.specialCards = parseInt(row.count, 10);
      else if (key === 'missions') stats.missions = parseInt(row.count, 10);
      else if (key === 'events') stats.events = parseInt(row.count, 10);
      else if (key === 'aspects') stats.aspects = parseInt(row.count, 10);
      else if (key === 'advanceduniversecards')
        stats.advancedUniverse = parseInt(row.count, 10);
      else if (key === 'teamworkcards') stats.teamwork = parseInt(row.count, 10);
      else if (key === 'allyuniversecards')
        stats.allyUniverse = parseInt(row.count, 10);
      else if (key === 'trainingcards') stats.training = parseInt(row.count, 10);
      else if (key === 'basicuniversecards')
        stats.basicUniverse = parseInt(row.count, 10);
      else if (key === 'powercards') stats.powerCards = parseInt(row.count, 10);
    });
    ctx.cache.cardStats = stats;
    ctx.cache.cardStatsCacheTime = now;
    return stats;
  } finally {
    client.release();
  }
}
