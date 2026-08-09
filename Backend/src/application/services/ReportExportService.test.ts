import { ReportExportService } from '@application/services/ReportExportService';
import { IFeedbackGeneratorService } from '@application/services/IFeedbackGeneratorService';
import { FinalFeedbackReport } from '@domain/entities/FinalFeedbackReport';
import { InterviewSession } from '@domain/entities/InterviewSession';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';

const completedSession: InterviewSession = {
  sessionId: 'session-123',
  candidateId: 'CAND-001',
  currentQuestion: null,
  currentTopic: null,
  difficulty: 'medium',
  questionsAsked: 1,
  topicsCovered: ['Vector Search'],
  remainingTopics: [],
  score: 8,
  history: [],
  status: 'completed',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:05:00.000Z',
};

const feedbackReport: FinalFeedbackReport = {
  candidateId: 'CAND-001',
  overallScore: 8,
  topicScores: [{ topic: 'Vector Search', score: 8 }],
  strengths: ['Clear explanation of embeddings'],
  weaknesses: [],
  missedConcepts: [],
  knowledgeGaps: [],
  improvementSuggestions: ['Study HNSW graph partitioning'],
  learningResources: ['pgvector documentation'],
  recommendedNextDifficulty: 'hard',
  generatedAt: '2026-01-01T00:05:00.000Z',
};

function createHarness() {
  const sessionRepository: jest.Mocked<ISessionRepository> = {
    findById: jest.fn().mockResolvedValue(completedSession),
    save: jest.fn(),
  };

  const feedbackGeneratorService: jest.Mocked<IFeedbackGeneratorService> = {
    generate: jest.fn().mockResolvedValue(feedbackReport),
  };

  const service = new ReportExportService(sessionRepository, feedbackGeneratorService);

  return { service, sessionRepository, feedbackGeneratorService };
}

describe('ReportExportService', () => {
  it('exports report in Markdown format by default', async () => {
    const { service } = createHarness();

    const result = await service.exportReport('session-123', 'markdown');

    expect(result.filename).toBe('interview-report-CAND-001-session-123.md');
    expect(result.contentType).toBe('text/markdown');
    expect(result.content).toContain('# Technical Interview Report');
    expect(result.content).toContain('Clear explanation of embeddings');
  });

  it('exports report in JSON format when format is json', async () => {
    const { service } = createHarness();

    const result = await service.exportReport('session-123', 'json');

    expect(result.filename).toBe('interview-report-CAND-001-session-123.json');
    expect(result.contentType).toBe('application/json');
    expect(JSON.parse(result.content).candidateId).toBe('CAND-001');
  });

  it('throws 404 AppError if session does not exist', async () => {
    const { service, sessionRepository } = createHarness();
    sessionRepository.findById.mockResolvedValueOnce(null);

    await expect(service.exportReport('unknown')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 409 AppError if session is not yet completed', async () => {
    const { service, sessionRepository } = createHarness();
    sessionRepository.findById.mockResolvedValueOnce({
      ...completedSession,
      status: 'in_progress',
    });

    await expect(service.exportReport('session-123')).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});
