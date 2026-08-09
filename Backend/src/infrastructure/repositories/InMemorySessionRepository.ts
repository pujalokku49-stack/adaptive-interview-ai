import { InterviewSession } from '@domain/entities/InterviewSession';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';

/**
 * Holds interview sessions in memory for the lifetime of the process.
 * Implements ISessionRepository so it can be swapped for a Redis- or
 * database-backed repository later (needed for multi-instance deployments,
 * since in-memory state doesn't survive a restart or scale horizontally)
 * without any change to the service or controller layers.
 */
export class InMemorySessionRepository implements ISessionRepository {
  private readonly sessions = new Map<string, InterviewSession>();

  public async save(session: InterviewSession): Promise<InterviewSession> {
    this.sessions.set(session.sessionId, session);
    return session;
  }

  public async findById(sessionId: string): Promise<InterviewSession | null> {
    return this.sessions.get(sessionId) ?? null;
  }
}
