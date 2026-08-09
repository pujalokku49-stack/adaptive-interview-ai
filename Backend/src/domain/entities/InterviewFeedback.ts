/**
 * Core domain entity. Matches the technical spec's `feedback` object
 * returned when an interview session completes.
 */
export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}
