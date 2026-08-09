import { InterviewDifficulty } from '@domain/entities/InterviewSession';
import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';

export interface AnswerEvaluationInput {
  question: string;
  answer: string;
  topic: string;
  difficulty: InterviewDifficulty;
}

/**
 * The controller/service layer depends on this interface, not a concrete
 * evaluator, so a heuristic placeholder (today) can be swapped for an
 * LLM-backed evaluator (later) without touching SessionService.
 */
export interface IAnswerEvaluatorService {
  evaluate(input: AnswerEvaluationInput): Promise<QuestionEvaluation>;
}
