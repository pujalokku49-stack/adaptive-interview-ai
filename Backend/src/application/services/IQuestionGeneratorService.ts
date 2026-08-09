import { InterviewDifficulty } from '@domain/entities/InterviewSession';
import { InterviewPlan } from '@domain/entities/InterviewPlan';
import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';

export interface QuestionGenerationContext {
  plan: InterviewPlan;
  /** Topics not yet asked, in original plan order (gaps first, then strengths). */
  remainingTopics: string[];
  /** Full evaluation history so far, most recent last. */
  history: QuestionEvaluation[];
  currentDifficulty: InterviewDifficulty;
}

export interface GeneratedQuestion {
  topic: string;
  question: string;
  difficulty: InterviewDifficulty;
  /** True when this re-probes the same topic just answered, rather than advancing. */
  isFollowUp: boolean;
}

/**
 * The controller/service layer depends on this interface, not a concrete
 * generator, so the adaptive (template-based) implementation can be
 * swapped for an LLM-driven one later without touching SessionService.
 */
export interface IQuestionGeneratorService {
  generateNext(
    context: QuestionGenerationContext
  ): Promise<GeneratedQuestion | null> | GeneratedQuestion | null;
}
