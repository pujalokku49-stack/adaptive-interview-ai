import { InterviewSession } from '@domain/entities/InterviewSession';

/**
 * Port defining how the domain expects to persist and read interview
 * sessions. Infrastructure provides the implementation (in-memory today,
 * Redis or a database later for multi-instance deployments) — the
 * application layer never depends on the concrete storage.
 */
export interface ISessionRepository {
  save(session: InterviewSession): Promise<InterviewSession>;
  findById(sessionId: string): Promise<InterviewSession | null>;
}
