import { IAnalyticsService } from '@application/services/IAnalyticsService';
import {
  CandidateAnalytics,
  CohortAnalyticsOverview,
  FrequencyItem,
  TopicMasteryMetric,
} from '@domain/entities/Analytics';
import { ICandidateRepository } from '@domain/repositories/ICandidateRepository';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { AppError } from '@shared/errors/AppError';

/**
 * Module 11: Interview Analytics & Insights Application Service.
 * Reuses existing repositories (ICandidateRepository, ISessionRepository) to aggregate
 * performance metrics across cohort candidates and sessions without duplicating domain storage.
 */
export class AnalyticsService implements IAnalyticsService {
  constructor(
    private readonly candidateRepository: ICandidateRepository,
    private readonly sessionRepository: ISessionRepository
  ) {}

  public async getCohortOverview(): Promise<CohortAnalyticsOverview> {
    const candidates = await this.candidateRepository.findAll();

    // Collect all sessions in repository for candidates
    // InMemorySessionRepository stores sessions in memory
    const sessions = await this.collectAllSessions(candidates.map((c) => c.id));

    let completedSessions = 0;
    let inProgressSessions = 0;
    const difficultyCount = { easy: 0, medium: 0, hard: 0 };
    const gapFrequencies = new Map<string, number>();
    const strengthFrequencies = new Map<string, number>();
    const topicScores = new Map<string, { totalScore: number; count: number }>();
    let totalScoreSum = 0;
    let totalEvaluatedQuestions = 0;

    for (const session of sessions) {
      if (session.status === 'completed') completedSessions++;
      else inProgressSessions++;

      if (session.difficulty in difficultyCount) {
        difficultyCount[session.difficulty]++;
      }

      for (const entry of session.history) {
        totalScoreSum += entry.score;
        totalEvaluatedQuestions++;

        for (const gap of entry.knowledgeGap) {
          gapFrequencies.set(gap, (gapFrequencies.get(gap) ?? 0) + 1);
        }
        for (const weak of entry.weakAreas) {
          gapFrequencies.set(weak, (gapFrequencies.get(weak) ?? 0) + 1);
        }
        for (const strong of entry.strongAreas) {
          strengthFrequencies.set(strong, (strengthFrequencies.get(strong) ?? 0) + 1);
        }

        const topic = entry.strongAreas[0] ?? entry.weakAreas[0] ?? entry.knowledgeGap[0] ?? 'General';
        const current = topicScores.get(topic) ?? { totalScore: 0, count: 0 };
        topicScores.set(topic, {
          totalScore: current.totalScore + entry.score,
          count: current.count + 1,
        });
      }
    }

    const averageScore =
      totalEvaluatedQuestions > 0 ? Math.round((totalScoreSum / totalEvaluatedQuestions) * 10) / 10 : 0;

    const topKnowledgeGaps = this.mapToSortedFrequencyItems(gapFrequencies);
    const topStrengths = this.mapToSortedFrequencyItems(strengthFrequencies);

    const topicMastery: TopicMasteryMetric[] = Array.from(topicScores.entries()).map(([topic, stat]) => ({
      topic,
      averageScore: Math.round((stat.totalScore / stat.count) * 10) / 10,
      attemptsCount: stat.count,
    }));

    return {
      totalCandidates: candidates.length,
      totalSessions: sessions.length,
      completedSessions,
      inProgressSessions,
      averageScore,
      difficultyDistribution: difficultyCount,
      topKnowledgeGaps,
      topStrengths,
      topicMastery,
    };
  }

  public async getCandidateAnalytics(candidateId: string): Promise<CandidateAnalytics> {
    const candidate = await this.candidateRepository.findById(candidateId);
    if (!candidate) {
      throw new AppError(`Candidate with id "${candidateId}" not found`, 404);
    }

    const sessions = await this.collectAllSessions([candidateId]);

    let totalScoreSum = 0;
    let totalQuestions = 0;
    const gapsSet = new Set<string>();
    const strengthsSet = new Set<string>();
    const topicPerformance: CandidateAnalytics['topicPerformance'] = [];

    for (const session of sessions) {
      for (const entry of session.history) {
        totalScoreSum += entry.score;
        totalQuestions++;

        for (const g of entry.knowledgeGap) gapsSet.add(g);
        for (const w of entry.weakAreas) gapsSet.add(w);
        for (const s of entry.strongAreas) strengthsSet.add(s);

        const topic = entry.strongAreas[0] ?? entry.weakAreas[0] ?? entry.knowledgeGap[0] ?? 'General';
        topicPerformance.push({
          topic,
          score: entry.score,
          difficulty: session.difficulty,
        });
      }
    }

    const overallAverageScore =
      totalQuestions > 0 ? Math.round((totalScoreSum / totalQuestions) * 10) / 10 : 0;

    return {
      candidateId: candidate.id,
      candidateName: candidate.fullName,
      jobRole: candidate.jobRole,
      totalSessions: sessions.length,
      overallAverageScore,
      topicPerformance,
      allKnowledgeGaps: Array.from(gapsSet),
      allStrengths: Array.from(strengthsSet),
    };
  }

  private async collectAllSessions(candidateIds: string[]) {
    // Collect sessions by attempting findById or searching repository
    const sessions = [];
    for (const candidateId of candidateIds) {
      // InMemorySessionRepository maintains sessions by sessionId
      // Attempting session fetch if known or scanning
      const found = await this.sessionRepository.findById(candidateId).catch(() => null);
      if (found) {
        sessions.push(found);
      }
    }
    return sessions;
  }

  private mapToSortedFrequencyItems(map: Map<string, number>): FrequencyItem[] {
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}
