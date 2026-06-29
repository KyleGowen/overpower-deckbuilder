import request from 'supertest';
import type { Application } from 'express';

/** New decks default to private (V285); cross-user read tests need a public deck. */
export async function makeDeckPublic(
  app: Application,
  deckId: string,
  ownerCookie: string,
): Promise<void> {
  await request(app)
    .put(`/api/v1/decks/${deckId}`)
    .set('Cookie', ownerCookie)
    .send({ is_private: false })
    .expect(200);
}
