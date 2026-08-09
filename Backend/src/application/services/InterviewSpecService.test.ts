import { InterviewSpecService } from '@application/services/InterviewSpecService';
import { IEvaluationEngineService } from '@application/services/IEvaluationEngineService';
import { ISessionService } from '@application/services/ISessionService';
import { Candidate } from '@domain/entities/Candidate';
import { InterviewFeedback } from '@domain/entities/InterviewFeedback';
import { InterviewSession } from '@domain/entities/InterviewSession';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';

const candidateData: Candidate = {
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

const activeSession: InterviewSession = {
  sessionId: 'test-session-1',
  candidateId: 'CAND-001',
  currentQuestion: 'Walk me through the retrieval engine',
  currentTopic: 'Retrieval Engine',
  difficulty: 'medium',
  questionsAsked: 1,
  topicsCovered: [],
  remainingTopics: ['Vector Search'],
  score: 0,
  history: [],
  status: 'in_progress',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const completedSession: InterviewSession = {
  ...activeSession,
  status: 'completed',
  currentQuestion: null,
  currentTopic: null,
  history: [
    {
      question: 'Walk me through the retrieval engine',
      answer: 'I used HNSW indexing',
      evaluation: 'Strong answer',
      score: 8,
      knowledgeGap: [],
      strongAreas: ['Retrieval Engine'],
      weakAreas: [],
    },
  ],
};

const feedbackResult: InterviewFeedback = {
  summary: 'Great performance.',
  strengths: ['Retrieval Engine'],
  gaps: [],
  next: ['No major gaps identified.'],
};

function createHarness() {
  const sessionService: jest.Mocked<ISessionService> = {
    startSession: jest.fn().mockResolvedValue(activeSession),
    getSession: jest.fn().mockResolvedValue(activeSession),
    submitAnswer: jest.fn().mockResolvedValue(activeSession),
  };

  const candidateRepository: jest.Mocked<ICandidateRepository> = {
    findAll: jest.fn(),
    findById: jest.fn().mockResolvedValue(candidateData),
    save: jest.fn().mockImplementation((c) => Promise.resolve(c)),
  };

  const evaluationEngineService: jest.Mocked<IEvaluationEngineService> = {
    buildFeedback: jest.fn().mockReturnValue(feedbackResult),
  };

  const service = new InterviewSpecService(
    sessionService,
    candidateRepository,
    evaluationEngineService
  );

  return {
    service,
    sessionService,
    candidateRepository,
    evaluationEngineService,
  };
}

describe('InterviewSpecService', () => {
  it('starts a new session when candidate payload is provided', async () => {
    const { service, sessionService } = createHarness();
    sessionService.getSession.mockRejectedValueOnce(new Error('not found'));

    const response = await service.handleRequest({
      sessionId: 'test-session-1',
      candidate: {
        id: 'CAND-001',
        fullName: 'Sarah Johnson',
      },
    });

    expect(sessionService.startSession).toHaveBeenCalledWith('CAND-001', 'test-session-1');
    expect(response.done).toBe(false);
    expect(response.reply).toContain('Welcome. Let\'s begin your interview.');
    expect(response.reply).toContain('Walk me through the retrieval engine');
  });

  it('saves new candidate if candidate does not exist in repository', async () => {
    const { service, candidateRepository } = createHarness();
    candidateRepository.findById.mockResolvedValueOnce(null);

    await service.handleRequest({
      sessionId: 'test-session-2',
      candidate: {
        id: 'CAND-999',
        fullName: 'New Candidate',
      },
    });

    expect(candidateRepository.save).toHaveBeenCalled();
  });

  it('advances interview turn when message payload is provided', async () => {
    const { service, sessionService } = createHarness();

    const response = await service.handleRequest({
      sessionId: 'test-session-1',
      message: 'My answer regarding HNSW indexing...',
    });

    expect(sessionService.submitAnswer).toHaveBeenCalledWith(
      'test-session-1',
      'My answer regarding HNSW indexing...'
    );
    expect(response.done).toBe(false);
    expect(response.reply).toBe('Walk me through the retrieval engine');
  });

  it('returns completion payload and feedback when interview turn completes session', async () => {
    const { service, sessionService, evaluationEngineService } = createHarness();
    sessionService.submitAnswer.mockResolvedValueOnce(completedSession);

    const response = await service.handleRequest({
      sessionId: 'test-session-1',
      message: 'Final answer.',
    });

    expect(response.done).toBe(true);
    expect(response.reply).toBe('Interview completed.');
    expect(response.feedback).toEqual(feedbackResult);
    expect(evaluationEngineService.buildFeedback).toHaveBeenCalledWith(completedSession);
  });

  it('returns completion payload if starting an already completed session', async () => {
    const { service, sessionService } = createHarness();
    sessionService.getSession.mockResolvedValueOnce(completedSession);

    const response = await service.handleRequest({
      sessionId: 'test-session-1',
      candidate: { id: 'CAND-001' },
    });

    expect(response.done).toBe(true);
    expect(response.reply).toBe('Interview completed.');
    expect(response.feedback).toEqual(feedbackResult);
  });

  it('throws 400 AppError for invalid request payloads lacking candidate or message', async () => {
    const { service } = createHarness();

    await expect(
      service.handleRequest({ sessionId: 's1' } as any)
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
