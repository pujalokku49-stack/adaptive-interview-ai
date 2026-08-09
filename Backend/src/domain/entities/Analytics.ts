/**
 * Core domain entities for Module 11: Interview Analytics & Insights.
 * Aggregates candidate performance metrics across interview sessions.
 */

export interface TopicMasteryMetric {
  topic: string;
  averageScore: number;
  attemptsCount: number;
}

export interface FrequencyItem {
  name: string;
  count: number;
}

export interface CohortAnalyticsOverview {
  totalCandidates: number;
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  averageScore: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  topKnowledgeGaps: FrequencyItem[];
  topStrengths: FrequencyItem[];
  topicMastery: TopicMasteryMetric[];
}

export interface CandidateTopicPerformance {
  topic: string;
  score: number;
  difficulty: string;
}

export interface CandidateAnalytics {
  candidateId: string;
  candidateName: string;
  jobRole: string;
  totalSessions: number;
  overallAverageScore: number;
  topicPerformance: CandidateTopicPerformance[];
  allKnowledgeGaps: string[];
  allStrengths: string[];
}
