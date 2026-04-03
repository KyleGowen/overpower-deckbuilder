/**
 * Read-only card catalog for DBV / v1. No HTTP types.
 */
export interface CardCatalogReader {
  getAllCharacters(): Promise<unknown[]>;
}

export class CatalogService {
  constructor(private readonly cards: CardCatalogReader) {}

  async getAllCharacters(): Promise<unknown[]> {
    return this.cards.getAllCharacters();
  }
}
