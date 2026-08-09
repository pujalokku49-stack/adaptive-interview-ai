import { Request, Response } from 'express';
import { IAnalyticsService } from '@application/services/IAnalyticsService';
import { AnalyticsCandidateParam } from '@interfaces/http/validation/analytics.validation';

/**
 * Controller for Module 11: Interview Analytics.
 * Delegates to IAnalyticsService and formats HTTP responses.
 */
export class AnalyticsController {
  constructor(private readonly analyticsService: IAnalyticsService) {}

  public getOverview = async (_req: Request, res: Response): Promise<void> => {
    const overview = await this.analyticsService.getCohortOverview();
    res.status(200).json({
      status: 'ok',
      data: overview,
    });
  };

  public getCandidateAnalytics = async (req: Request, res: Response): Promise<void> => {
    const { candidateId } = req.params as unknown as AnalyticsCandidateParam;
    const analytics = await this.analyticsService.getCandidateAnalytics(candidateId);
    res.status(200).json({
      status: 'ok',
      data: analytics,
    });
  };
}
