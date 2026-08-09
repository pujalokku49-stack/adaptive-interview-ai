import { InterviewSession } from '@domain/entities/InterviewSession';
import { InMemorySessionRepository } from '@infrastructure/repositories/InMemorySessionRepository';

function makeSession(overrides: Partial<InterviewSession> = {}): InterviewSession {
  return {
    sessionId: '11111111-1111-4111-8111-111111111111',
    candidateId: 'CAND-001',
    currentQuestion: 'Q1',
    currentTopic: 'Embeddings Explained',
    difficulty: 'easy',
    questionsAsked: 1,
    topicsCovered: [],
    remainingTopics: [],
    score: 0,
    history: [],
    status: 'in_progress',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('InMemorySessionRepository', () => {
  it('saves and retrieves a session by id', async () => {
    const repository = new InMemorySessionRepository();
    const session = makeSession();

    await repository.save(session);
    const result = await repository.findById(session.sessionId);

    expect(result).toEqual(session);
  });

  it('returns null for an unknown session id', async () => {
    const repository = new InMemorySessionRepository();

    const result = await repository.findById('does-not-exist');

    expect(result).toBeNull();
  });

  it('overwrites the previous state on save (upsert)', async () => {
    const repository = new InMemorySessionRepository();
    const session = makeSession();

    await repository.save(session);
    await repository.save({ ...session, score: 5, status: 'completed' });
    const result = await repository.findById(session.sessionId);

    expect(result?.score).toBe(5);
    expect(result?.status).toBe('completed');
  });
});
