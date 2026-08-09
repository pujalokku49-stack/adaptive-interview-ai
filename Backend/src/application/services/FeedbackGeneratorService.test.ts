import { FeedbackGeneratorService } from '@application/services/FeedbackGeneratorService';
import { EvaluationEngineService } from '@application/services/EvaluationEngineService';
import { ICandidateService } from '@application/services/ICandidateService';
import { ICurriculumService } from '@application/services/ICurriculumService';
import { IInterviewPlannerService } from '@application/services/IInterviewPlannerService';
import { Curriculum } from '@domain/entities/Curriculum';
import { InterviewPlan } from '@domain/entities/InterviewPlan';
import { InterviewSession } from '@domain/entities/InterviewSession';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { ILLMProvider } from '@domain/providers/ILLMProvider';

const candidateDTO = {
  id: 'CAND-001',
  fullName: 'Sarah Johnson',
  jobRole: 'Senior Data Engineer',
  yearsExperience: 9,
  education: 'MS Computer Science',
  status: 'COMPLETED',
  missions: [],
  signals: {
    commitDays: 28,
    missionsCompleted: 2,
    missionsFirstTry: 1,
  },
};

const curriculum: Curriculum = {
  cohort: 'Test Cohort',
  modules: [
    {
      n: 3,
      title: 'Embeddings & Vector Search',
      days: [7, 10],
    },
  ],
  days: [],
};

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
  strengths: [],
  suggestedQuestions: [],
  generatedAt: '2026-01-01T00:00:00.000Z',
};

const completedSession: InterviewSession = {
  sessionId: '11111111-1111-4111-8111-111111111111',
  candidateId: 'CAND-001',
  currentQuestion: null,
  currentTopic: null,
  difficulty: 'medium',
  questionsAsked: 1,
  topicsCovered: ['The Retrieval & Matching Engine'],
  remainingTopics: [],
  score: 6,
  history: [
    {
      question: 'Walk me through the retrieval engine',
      answer: 'It routes queries to the right index',
      evaluation: 'Partial answer',
      score: 6,
      knowledgeGap: [],
      strongAreas: [],
      weakAreas: ['The Retrieval & Matching Engine'],
    },
  ],
  status: 'completed',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:05:00.000Z',
};

const validLLMJson = JSON.stringify({
  candidateId: 'CAND-001',
  overallScore: 7,
  topicScores: [
    {
      topic: 'The Retrieval & Matching Engine',
      score: 6,
    },
  ],
  strengths: ['Clear communication'],
  weaknesses: ['Query routing depth'],
  missedConcepts: ['Caching strategy'],
  knowledgeGaps: ['Vector index internals'],
  improvementSuggestions: ['Study ANN index structures'],
  learningResources: ['pgvector docs', 'FAISS tutorial'],
  recommendedNextDifficulty: 'medium',
});

function createHarness(llmProvider: jest.Mocked<ILLMProvider>) {
  const candidateService: jest.Mocked<ICandidateService> = {
    getAllCandidates: jest.fn(),
    getCandidateById: jest.fn().mockResolvedValue(candidateDTO),
  };

  const curriculumService: jest.Mocked<ICurriculumService> = {
    getCurriculum: jest.fn().mockResolvedValue(curriculum),
    getDay: jest.fn(),
  };

  const interviewPlannerService: jest.Mocked<IInterviewPlannerService> = {
    buildPlan: jest.fn().mockResolvedValue(plan),
  };

  const sessionRepository: jest.Mocked<ISessionRepository> = {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(completedSession),
  };

  const evaluationEngineService = new EvaluationEngineService();

  const service = new FeedbackGeneratorService(
    candidateService,
    curriculumService,
    interviewPlannerService,
    sessionRepository,
    llmProvider,
    evaluationEngineService
  );

  return {
    service,
    sessionRepository,
    candidateService,
  };
}

describe('FeedbackGeneratorService', () => {
  it('throws a 404 AppError when the session does not exist', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn(),
    };

    const { service, sessionRepository } = createHarness(llmProvider);

    sessionRepository.findById.mockResolvedValue(null);

    await expect(service.generate('unknown')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws a 409 AppError when the session is not yet completed', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn(),
    };

    const { service, sessionRepository } = createHarness(llmProvider);

    sessionRepository.findById.mockResolvedValueOnce({
      ...completedSession,
      status: 'in_progress',
    });

    await expect(
      service.generate(completedSession.sessionId)
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('returns the LLM-generated report when the provider responds with valid JSON', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockResolvedValue({
        text: validLLMJson,
      }),
    };

    const { service } = createHarness(llmProvider);

    const report = await service.generate(completedSession.sessionId);

    expect(report.candidateId).toBe('CAND-001');
    expect(report.overallScore).toBe(7);
    expect(report.recommendedNextDifficulty).toBe('medium');
    expect(report.learningResources).toEqual([
      'pgvector docs',
      'FAISS tutorial',
    ]);
    expect(report.generatedAt).toBeDefined();
  });

  it('strips markdown code fences before parsing', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockResolvedValue({
        text: '```json\n' + validLLMJson + '\n```',
      }),
    };

    const { service } = createHarness(llmProvider);

    const report = await service.generate(completedSession.sessionId);

    expect(report.overallScore).toBe(7);
  });

  it('falls back to a deterministic report when the LLM returns malformed JSON', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockResolvedValue({
        text: 'not json at all {',
      }),
    };

    const { service } = createHarness(llmProvider);

    const report = await service.generate(completedSession.sessionId);

    expect(report.candidateId).toBe('CAND-001');

    expect(report.topicScores).toEqual([
      {
        topic: 'The Retrieval & Matching Engine',
        score: 6,
      },
    ]);

    expect(report.weaknesses).toContain(
      'The Retrieval & Matching Engine'
    );
  });

  it('falls back to a deterministic report when the JSON fails schema validation', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          candidateId: 'CAND-001',
        }),
      }),
    };

    const { service } = createHarness(llmProvider);

    const report = await service.generate(completedSession.sessionId);

    expect(report.recommendedNextDifficulty).toBe('medium');
  });

  it('falls back to a deterministic report when the LLM provider throws', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockRejectedValue(
        new Error('network error')
      ),
    };

    const { service } = createHarness(llmProvider);

    const report = await service.generate(completedSession.sessionId);

    expect(report.candidateId).toBe('CAND-001');
    expect(report.overallScore).toBe(6);
  });

  it('recommends easy/medium/hard difficulty based on the fallback overall score', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockRejectedValue(
        new Error('down')
      ),
    };

    const lowScoreSession = {
      ...completedSession,
      score: 2,
    };

    const { service, sessionRepository } =
      createHarness(llmProvider);

    sessionRepository.findById.mockResolvedValueOnce(
      lowScoreSession
    );

    const report = await service.generate(
      lowScoreSession.sessionId
    );

    expect(report.recommendedNextDifficulty).toBe('easy');
  });
});
