import { EvaluationEngineService } from '@application/services/EvaluationEngineService';
import { InterviewSession } from '@domain/entities/InterviewSession';
import { AppError } from '@shared/errors/AppError';

function makeSession(overrides: Partial<InterviewSession> = {}): InterviewSession {
  return {
    sessionId: '11111111-1111-4111-8111-111111111111',
    candidateId: 'CAND-001',
    currentQuestion: null,
    currentTopic: null,
    difficulty: 'medium',
    questionsAsked: 2,
    topicsCovered: ['The Retrieval & Matching Engine', 'Embeddings Explained'],
    remainingTopics: [],
    score: 13,
    history: [
      {
        question: 'Q1',
        answer: 'A1',
        evaluation: 'Weak answer on "The Retrieval & Matching Engine".',
        score: 3,
        knowledgeGap: ['The Retrieval & Matching Engine'],
        strongAreas: [],
        weakAreas: ['The Retrieval & Matching Engine'],
      },
      {
        question: 'Q2',
        answer: 'A2',
        evaluation: 'Strong, relevant answer on "Embeddings Explained".',
        score: 10,
        knowledgeGap: [],
        strongAreas: ['Embeddings Explained'],
        weakAreas: [],
      },
    ],
    status: 'completed',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:05:00.000Z',
    ...overrides,
  };
}

describe('EvaluationEngineService', () => {
  const engine = new EvaluationEngineService();

  it('throws a 409 AppError when the session is not yet completed', () => {
    const session = makeSession({ status: 'in_progress' });

    expect(() => engine.buildFeedback(session)).toThrow(AppError);
    expect(() => engine.buildFeedback(session)).toThrow(expect.objectContaining({ statusCode: 409 }));
  });

  it('collects strengths and gaps from the full history, deduplicated', () => {
    const session = makeSession();

    const feedback = engine.buildFeedback(session);

    expect(feedback.strengths).toEqual(['Embeddings Explained']);
    expect(feedback.gaps).toEqual(['The Retrieval & Matching Engine']);
  });

  it('produces a next-steps entry per gap', () => {
    const session = makeSession();

    const feedback = engine.buildFeedback(session);

    expect(feedback.next).toHaveLength(1);
    expect(feedback.next[0]).toContain('The Retrieval & Matching Engine');
  });

  it('falls back to a generic next-step when there are no gaps', () => {
    const session = makeSession({
      history: [
        {
          question: 'Q1',
          answer: 'A1',
          evaluation: 'Strong answer.',
          score: 9,
          knowledgeGap: [],
          strongAreas: ['Embeddings Explained'],
          weakAreas: [],
        },
      ],
    });

    const feedback = engine.buildFeedback(session);

    expect(feedback.gaps).toEqual([]);
    expect(feedback.next).toHaveLength(1);
    expect(feedback.next[0]).toMatch(/no major gaps/i);
  });

  it('includes candidate id, question count, and average score in the summary', () => {
    const session = makeSession();

    const feedback = engine.buildFeedback(session);

    expect(feedback.summary).toContain('CAND-001');
    expect(feedback.summary).toContain('2 question');
    expect(feedback.summary).toContain('6.5/10'); // (3 + 10) / 2
  });
});
