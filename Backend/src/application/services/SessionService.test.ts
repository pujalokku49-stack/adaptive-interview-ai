import { AdaptiveQuestionGeneratorService } from '@application/services/AdaptiveQuestionGeneratorService';
import { IAnswerEvaluatorService } from '@application/services/IAnswerEvaluatorService';
import { IInterviewPlannerService } from '@application/services/IInterviewPlannerService';
import { SessionService } from '@application/services/SessionService';
import { InterviewPlan } from '@domain/entities/InterviewPlan';
import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { AppError } from '@shared/errors/AppError';

const plan: InterviewPlan = {
  candidateId: 'CAND-001',
  candidateName: 'Sarah Johnson',
  jobRole: 'Senior Data Engineer',
  gaps: [
    {
      day: 10,
      moduleTitle: 'Embeddings & Vector Search',
      dayTitle: 'The Retrieval & Matching Engine',
      reason: 'failed',
      objectives: ['Build a query router'],
    },
  ],
  strengths: [
    {
      day: 7,
      moduleTitle: 'Embeddings & Vector Search',
      dayTitle: 'Embeddings Explained',
      reason: 'strong_first_try',
      objectives: ['Generate embeddings for every knowledge base chunk'],
    },
  ],
  suggestedQuestions: [],
  generatedAt: '2026-01-01T00:00:00.000Z',
};

function createMockPlanner(): jest.Mocked<IInterviewPlannerService> {
  return { buildPlan: jest.fn().mockResolvedValue(plan) };
}

function createInMemoryRepo(): ISessionRepository {
  const store = new Map();
  return {
    save: jest.fn(async (session) => {
      store.set(session.sessionId, session);
      return session;
    }),
    findById: jest.fn(async (id) => store.get(id) ?? null),
  };
}

function createMockEvaluator(result: Partial<QuestionEvaluation> = {}): jest.Mocked<IAnswerEvaluatorService> {
  return {
    evaluate: jest.fn().mockImplementation((input) =>
      Promise.resolve({
        question: input.question,
        answer: input.answer,
        evaluation: 'Strong answer',
        score: 8,
        knowledgeGap: [],
        strongAreas: [input.topic],
        weakAreas: [],
        ...result,
      })
    ),
  };
}

describe('SessionService', () => {
  describe('startSession', () => {
    it('seeds the session from the candidate plan: gaps first, then strengths', async () => {
      const planner = createMockPlanner();
      const repository = createInMemoryRepo();
      const evaluator = createMockEvaluator();
      const service = new SessionService(planner, repository, evaluator, new AdaptiveQuestionGeneratorService());

      const session = await service.startSession('CAND-001');

      expect(session.candidateId).toBe('CAND-001');
      expect(session.currentTopic).toBe('The Retrieval & Matching Engine'); // gap comes first
      expect(session.difficulty).toBe('medium'); // 'failed' -> medium
      expect(session.remainingTopics).toEqual(['Embeddings Explained']);
      expect(session.questionsAsked).toBe(1);
      expect(session.status).toBe('in_progress');
      expect(session.score).toBe(0);
      expect(session.history).toEqual([]);
    });

    it('marks the session completed immediately when the plan has no topics', async () => {
      const emptyPlan: InterviewPlan = { ...plan, gaps: [], strengths: [] };
      const planner: jest.Mocked<IInterviewPlannerService> = {
        buildPlan: jest.fn().mockResolvedValue(emptyPlan),
      };
      const repository = createInMemoryRepo();
      const evaluator = createMockEvaluator();
      const service = new SessionService(planner, repository, evaluator, new AdaptiveQuestionGeneratorService());

      const session = await service.startSession('CAND-001');

      expect(session.status).toBe('completed');
      expect(session.currentQuestion).toBeNull();
    });
  });

  describe('getSession', () => {
    it('throws a 404 AppError for an unknown session', async () => {
      const planner = createMockPlanner();
      const repository = createInMemoryRepo();
      const evaluator = createMockEvaluator();
      const service = new SessionService(planner, repository, evaluator, new AdaptiveQuestionGeneratorService());

      await expect(service.getSession('unknown')).rejects.toBeInstanceOf(AppError);
      await expect(service.getSession('unknown')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('submitAnswer', () => {
    it('records history, updates score, and advances to the next topic', async () => {
      const planner = createMockPlanner();
      const repository = createInMemoryRepo();
      const evaluator = createMockEvaluator({ score: 8, strongAreas: ['x'] });
      const service = new SessionService(planner, repository, evaluator, new AdaptiveQuestionGeneratorService());

      const started = await service.startSession('CAND-001');
      const updated = await service.submitAnswer(started.sessionId, 'my answer');

      expect(updated.history).toHaveLength(1);
      expect(updated.history[0]?.score).toBe(8);
      expect(updated.score).toBe(8);
      expect(updated.topicsCovered).toEqual(['The Retrieval & Matching Engine']);
      expect(updated.currentTopic).toBe('Embeddings Explained'); // advanced to the strength
      expect(updated.difficulty).toBe('hard'); // 'strong_first_try' -> hard
      expect(updated.remainingTopics).toEqual([]);
      expect(updated.status).toBe('in_progress');
    });

    it('completes the session once the last topic is answered', async () => {
      const planner = createMockPlanner();
      const repository = createInMemoryRepo();
      const evaluator = createMockEvaluator();
      const service = new SessionService(planner, repository, evaluator, new AdaptiveQuestionGeneratorService());

      const started = await service.startSession('CAND-001');
      const afterFirst = await service.submitAnswer(started.sessionId, 'answer 1');
      const afterSecond = await service.submitAnswer(afterFirst.sessionId, 'answer 2');

      expect(afterSecond.status).toBe('completed');
      expect(afterSecond.currentQuestion).toBeNull();
      expect(afterSecond.currentTopic).toBeNull();
      expect(afterSecond.history).toHaveLength(2);
    });

    it('rejects submitting an answer to an already-completed session', async () => {
      const planner = createMockPlanner();
      const repository = createInMemoryRepo();
      const evaluator = createMockEvaluator();
      const service = new SessionService(planner, repository, evaluator, new AdaptiveQuestionGeneratorService());

      const started = await service.startSession('CAND-001');
      const afterFirst = await service.submitAnswer(started.sessionId, 'answer 1');
      const afterSecond = await service.submitAnswer(afterFirst.sessionId, 'answer 2');

      await expect(service.submitAnswer(afterSecond.sessionId, 'too late')).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it('issues a same-topic follow-up (Module 7) after a weak answer instead of advancing', async () => {
      const planner = createMockPlanner();
      const repository = createInMemoryRepo();
      // Weak answer: score < 4, topic recoverable from knowledgeGap/weakAreas.
      const weakEvaluator: jest.Mocked<IAnswerEvaluatorService> = {
        evaluate: jest.fn().mockImplementation((input) =>
          Promise.resolve({
            question: input.question,
            answer: input.answer,
            evaluation: 'Weak answer',
            score: 2,
            knowledgeGap: [input.topic],
            strongAreas: [],
            weakAreas: [input.topic],
          })
        ),
      };
      const service = new SessionService(
        planner,
        repository,
        weakEvaluator,
        new AdaptiveQuestionGeneratorService()
      );

      const started = await service.startSession('CAND-001');
      const afterFirst = await service.submitAnswer(started.sessionId, 'a weak answer here');

      // Stays on the same topic instead of advancing to the strength.
      expect(afterFirst.currentTopic).toBe('The Retrieval & Matching Engine');
      // Not yet marked covered, since we're still probing it.
      expect(afterFirst.topicsCovered).toEqual([]);
      expect(afterFirst.remainingTopics).toEqual(['Embeddings Explained']);
      expect(afterFirst.status).toBe('in_progress');

      // A second weak answer on the same topic must not loop forever —
      // the generator caps follow-ups at one per topic and advances.
      const afterSecond = await service.submitAnswer(afterFirst.sessionId, 'still weak');
      expect(afterSecond.currentTopic).toBe('Embeddings Explained');
      expect(afterSecond.topicsCovered).toEqual(['The Retrieval & Matching Engine']);
    });
  });
});
