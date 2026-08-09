import { CandidateAnalytics, CohortAnalyticsOverview } from '@domain/entities/Analytics';

/**
 * Application service interface for Module 11: Interview Analytics.
 */
export interface IAnalyticsService {
  getCohortOverview(): Promise<CohortAnalyticsOverview>;
  getCandidateAnalytics(candidateId: string): Promise<CandidateAnalytics>;
}
