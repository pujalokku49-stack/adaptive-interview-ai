import { AnalyticsService } from '@application/services/AnalyticsService';
import { Candidate } from '@domain/entities/Candidate';
import { InterviewSession } from '@domain/entities/InterviewSession';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';

const candidate: Candidate = {
  id: 'CAND-001',
  fullName: 'Sarah Johnson',
  jobRole: 'Senior Data Engineer',
  yearsExperience: 9,
  education: 'MS Computer Science',
  status: 'COMPLETED',
  missions: [],
  signals: { commitDays: 28, missionsCompleted: 2, missionsFirstTry: 1 },
};

const session: InterviewSession = {
  sessionId: 'CAND-001',
  candidateId: 'CAND-001',
  currentQuestion: null,
  currentTopic: null,
  difficulty: 'medium',
  questionsAsked: 1,
  topicsCovered: ['Embeddings'],
  remainingTopics: [],
  score: 8,
  history: [
    {
      question: 'Explain vector embeddings',
      answer: 'High dimensional vectors',
      evaluation: 'Good answer',
      score: 8,
      knowledgeGap: [],
      strongAreas: ['Embeddings'],
      weakAreas: [],
    },
  ],
  status: 'completed',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:05:00.000Z',
};

function createHarness() {
  const candidateRepository: jest.Mocked<ICandidateRepository> = {
    findAll: jest.fn().mockResolvedValue([candidate]),
    findById: jest.fn().mockResolvedValue(candidate),
    save: jest.fn(),
  };

  const sessionRepository: jest.Mocked<ISessionRepository> = {
    findById: jest.fn().mockResolvedValue(session),
    save: jest.fn(),
  };

  const service = new AnalyticsService(candidateRepository, sessionRepository);

  return { service, candidateRepository, sessionRepository };
}

describe('AnalyticsService', () => {
  it('computes cohort overview analytics correctly', async () => {
    const { service } = createHarness();

    const overview = await service.getCohortOverview();

    expect(overview.totalCandidates).toBe(1);
    expect(overview.totalSessions).toBe(1);
    expect(overview.completedSessions).toBe(1);
    expect(overview.averageScore).toBe(8);
    expect(overview.topStrengths).toEqual([{ name: 'Embeddings', count: 1 }]);
  });

  it('computes candidate analytics correctly', async () => {
    const { service } = createHarness();

    const analytics = await service.getCandidateAnalytics('CAND-001');

    expect(analytics.candidateId).toBe('CAND-001');
    expect(analytics.candidateName).toBe('Sarah Johnson');
    expect(analytics.overallAverageScore).toBe(8);
    expect(analytics.allStrengths).toContain('Embeddings');
  });

  it('throws 404 AppError if candidate is not found', async () => {
    const { service, candidateRepository } = createHarness();
    candidateRepository.findById.mockResolvedValueOnce(null);

    await expect(service.getCandidateAnalytics('unknown')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
