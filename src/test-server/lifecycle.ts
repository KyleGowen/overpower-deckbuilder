/**
 * Test server lifecycle: initializeTestServer() and closeTestServer().
 * Uses app and guestDeckPersistence from bootstrap.
 */
import type { Server } from 'http';
import { app, guestDeckPersistence, databaseInit, userRepository, deckRepository, cardRepository } from './bootstrap';

const PORT = process.env.PORT || 3000;
let testServer: Server | null = null;
let serverInitialized = false;

export async function initializeTestServer(): Promise<{ app: typeof app; server: Server }> {
  if (serverInitialized && testServer) {
    return { app, server: testServer };
  }

  await databaseInit.initializeDatabase();
  await Promise.all([
    userRepository.initialize(),
    deckRepository.initialize(),
    cardRepository.initialize()
  ]);

  try {
    testServer = await new Promise<Server>((resolve, reject) => {
      const server = app.listen(PORT, () => resolve(server));
      server.once('error', reject);
    });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'EADDRINUSE') {
      serverInitialized = true;
      // Some suites only need a supertest target; returning the app keeps them
      // isolated when another integration worker already owns the port.
      return { app, server: app as unknown as Server };
    }
    throw error;
  }

  serverInitialized = true;
  return { app, server: testServer };
}

export async function closeTestServer(): Promise<void> {
  guestDeckPersistence.destroy();
  const server = testServer;
  if (server) {
    return new Promise<void>((resolve) => {
      server.close(() => {
        testServer = null;
        serverInitialized = false;
        resolve();
      });
    });
  }
}
