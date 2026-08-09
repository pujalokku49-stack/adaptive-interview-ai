import { InterviewFeedback } from '@domain/entities/InterviewFeedback';

/**
 * Core domain entities for Module 10: Standard Technical Specification Adapter.
 * Maps to technical-spec.md POST /api/interview request and response contracts.
 */

export interface CandidatePayload {
  id: string;
  fullName?: string;
  jobRole?: string;
  yearsExperience?: number;
  education?: string;
  status?: string;
  missions?: Array<{
    day: number;
    title: string;
    passed?: boolean;
    skipped?: boolean;
    attempts?: number;
  }>;
  signals?: {
    commitDays: number;
    missionsCompleted: number;
    missionsFirstTry: number;
  };
}

export interface InterviewSpecRequest {
  sessionId: string;
  candidate?: CandidatePayload;
  message?: string;
}

export interface InterviewSpecResponse {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
}
