import { InterviewDifficulty } from '@domain/entities/InterviewSession';

/**
 * Core domain entity. The richer, LLM-synthesized report produced once an
 * interview session completes — distinct from Module 8's InterviewFeedback
 * (which mirrors the technical spec's minimal summary/strengths/gaps/next
 * shape). Framework- and LLM-provider-agnostic.
 */
export interface TopicScore {
  topic: string;
  score: number;
}

export interface FinalFeedbackReport {
  candidateId: string;
  overallScore: number;
  topicScores: TopicScore[];
  strengths: string[];
  weaknesses: string[];
  missedConcepts: string[];
  knowledgeGaps: string[];
  improvementSuggestions: string[];
  learningResources: string[];
  recommendedNextDifficulty: InterviewDifficulty;
  generatedAt: string;
}
