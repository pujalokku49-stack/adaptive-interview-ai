import { InterviewSession } from '@domain/entities/InterviewSession';

/**
 * The controller depends on this interface, not the concrete
 * SessionService, keeping the interface-adapter layer decoupled from
 * application internals and trivially mockable in tests.
 */
export interface ISessionService {
  startSession(candidateId: string, customSessionId?: string): Promise<InterviewSession>;
  getSession(sessionId: string): Promise<InterviewSession>;
  submitAnswer(sessionId: string, answer: string): Promise<InterviewSession>;
}
