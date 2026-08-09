import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';

export type InterviewDifficulty = 'easy' | 'medium' | 'hard';
export type SessionStatus = 'in_progress' | 'completed';

/**
 * Core domain entity. Tracks the full state of one candidate's interview
 * conversation across the multiple HTTP turns described in the technical
 * spec (start -> N conversation turns -> end). Framework-agnostic.
 *
 * `history` holds one QuestionEvaluation (Module 6) per answered question,
 * in the order they were answered.
 */
export interface InterviewSession {
  sessionId: string;
  candidateId: string;
  currentQuestion: string | null;
  currentTopic: string | null;
  difficulty: InterviewDifficulty;
  questionsAsked: number;
  topicsCovered: string[];
  remainingTopics: string[];
  score: number;
  history: QuestionEvaluation[];
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}
