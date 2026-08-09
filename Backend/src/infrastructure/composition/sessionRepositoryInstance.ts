import { InMemorySessionRepository } from '@infrastructure/repositories/InMemorySessionRepository';

/**
 * Single shared InMemorySessionRepository instance so every route module
 * that touches sessions (session.routes.ts, finalFeedback.routes.ts, etc.)
 * reads/writes the same in-memory store.
 */
export const sessionRepository = new InMemorySessionRepository();
