/**
 * Core domain entity. Represents the outcome of reasoning over a
 * candidate's mission history against the cohort curriculum: which topics
 * to probe (gaps) and which to push deeper on (strengths).
 */
export type InterviewFocusReason = 'failed' | 'skipped' | 'not_attempted' | 'strong_first_try';

export interface InterviewFocusArea {
  day: number;
  moduleTitle: string;
  dayTitle: string;
  reason: InterviewFocusReason;
  objectives: string[];
}

export interface InterviewPlan {
  candidateId: string;
  candidateName: string;
  jobRole: string;
  strengths: InterviewFocusArea[];
  gaps: InterviewFocusArea[];
  suggestedQuestions: string[];
  generatedAt: string;
}
