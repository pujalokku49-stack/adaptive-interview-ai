import {
  AnswerEvaluationInput,
  IAnswerEvaluatorService,
} from '@application/services/IAnswerEvaluatorService';
import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';

const MIN_SUBSTANTIVE_LENGTH = 15;
const STRONG_ANSWER_THRESHOLD = 7;
const PARTIAL_ANSWER_THRESHOLD = 4;
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is',
  'are', 'you', 'your', 'how', 'what', 'walk', 'me', 'through', 'explain',
  'would', 'do', 'did', 'it', 'that', 'this', 'be', 'was', 'were',
]);

function significantWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word))
  );
}

/**
 * Deterministic, dependency-free stand-in for a real evaluator. Scores an
 * answer 0-10 on length and keyword overlap with the question, then buckets
 * the result into strong/partial/weak. No LLM call, no network dependency
 * — intentionally simple so the session pipeline (Modules 5-6) can be
 * exercised end-to-end today.
 *
 * This is the natural seam to swap in an LLM-backed evaluator later: same
 * IAnswerEvaluatorService contract, just a different implementation
 * wired into SessionService's composition root.
 */
export class HeuristicAnswerEvaluatorService implements IAnswerEvaluatorService {
  public async evaluate(input: AnswerEvaluationInput): Promise<QuestionEvaluation> {
    const trimmed = input.answer.trim();

    if (trimmed.length < MIN_SUBSTANTIVE_LENGTH) {
      return {
        question: input.question,
        answer: input.answer,
        evaluation: `No substantive answer provided for "${input.topic}".`,
        score: 0,
        knowledgeGap: [input.topic],
        strongAreas: [],
        weakAreas: [input.topic],
      };
    }

    const score = this.scoreAnswer(input);

    if (score >= STRONG_ANSWER_THRESHOLD) {
      return {
        question: input.question,
        answer: input.answer,
        evaluation: `Strong, relevant answer on "${input.topic}".`,
        score,
        knowledgeGap: [],
        strongAreas: [input.topic],
        weakAreas: [],
      };
    }

    if (score >= PARTIAL_ANSWER_THRESHOLD) {
      return {
        question: input.question,
        answer: input.answer,
        evaluation: `Partial answer on "${input.topic}" — some relevant detail but missing depth.`,
        score,
        knowledgeGap: [],
        strongAreas: [],
        weakAreas: [input.topic],
      };
    }

    return {
      question: input.question,
      answer: input.answer,
      evaluation: `Weak answer on "${input.topic}" — lacked relevant detail.`,
      score,
      knowledgeGap: [input.topic],
      strongAreas: [],
      weakAreas: [input.topic],
    };
  }

  private scoreAnswer(input: AnswerEvaluationInput): number {
    const questionWords = significantWords(input.question);
    const answerWords = significantWords(input.answer);
    const overlap = [...questionWords].filter((word) => answerWords.has(word)).length;

    const lengthScore = Math.min(5, Math.floor(input.answer.trim().split(/\s+/).length / 20));
    const relevanceScore = Math.min(5, overlap);
    const difficultyPenalty = input.difficulty === 'hard' ? 1 : 0;

    return Math.max(0, Math.min(10, lengthScore + relevanceScore - difficultyPenalty));
  }
}
