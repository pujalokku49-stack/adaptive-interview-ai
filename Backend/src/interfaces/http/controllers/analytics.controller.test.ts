import { Request, Response } from 'express';
import { AnalyticsController } from '@interfaces/http/controllers/analytics.controller';
import { IAnalyticsService } from '@application/services/IAnalyticsService';

describe('AnalyticsController', () => {
  it('returns HTTP 200 with cohort overview data', async () => {
    const analyticsService: jest.Mocked<IAnalyticsService> = {
      getCohortOverview: jest.fn().mockResolvedValue({
        totalCandidates: 10,
        totalSessions: 15,
        completedSessions: 12,
        inProgressSessions: 3,
        averageScore: 7.8,
        difficultyDistribution: { easy: 3, medium: 8, hard: 4 },
        topKnowledgeGaps: [],
        topStrengths: [],
        topicMastery: [],
      }),
      getCandidateAnalytics: jest.fn(),
    };

    const controller = new AnalyticsController(analyticsService);

    const req = {} as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await controller.getOverview(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      data: expect.objectContaining({ totalCandidates: 10 }),
    });
  });
});
