import { Pool } from 'pg';

export interface CollectionRepositoryContext {
  pool: Pool;
}

export function createCollectionRepositoryContext(pool: Pool): CollectionRepositoryContext {
  return { pool };
}
