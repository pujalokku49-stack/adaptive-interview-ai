import {
  AnswerEvaluationInput,
  IAnswerEvaluatorService,
} from '@application/services/IAnswerEvaluatorService';
import { buildAnswerEvaluationPrompt } from '@application/services/prompts/answerEvaluatorPrompt';
import { answerEvaluationSchema } from '@application/validation/answerEvaluation.validation';
import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';
import { ILLMProvider } from '@domain/providers/ILLMProvider';
import { logger } from '@infrastructure/logger/logger';

/**
 * LLM-powered implementation of IAnswerEvaluatorService.
 * Evaluates candidate answers using LLM synthesis with Zod schema validation.
 * Degrades gracefully to a deterministic fallback evaluator (such as
 * HeuristicAnswerEvaluatorService) if the LLM call or JSON parsing fails.
 */
export class LLMAnswerEvaluatorService implements IAnswerEvaluatorService {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly fallbackEvaluator: IAnswerEvaluatorService
  ) {}

  public async evaluate(input: AnswerEvaluationInput): Promise<QuestionEvaluation> {
    try {
      const request = buildAnswerEvaluationPrompt(input);
      const completion = await this.llmProvider.complete(request);
      return this.parseAndValidate(completion.text, input);
    } catch (err) {
      logger.warn(
        { err, topic: input.topic, difficulty: input.difficulty },
        'LLM answer evaluation failed — falling back to deterministic evaluator'
      );
      return this.fallbackEvaluator.evaluate(input);
    }
  }

  private parseAndValidate(rawText: string, input: AnswerEvaluationInput): QuestionEvaluation {
    const jsonText = this.extractJson(rawText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('LLM answer evaluation response was not valid JSON');
    }

    const result = answerEvaluationSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`LLM answer evaluation schema validation failed: ${result.error.message}`);
    }

    return {
      question: input.question,
      answer: input.answer,
      evaluation: result.data.evaluation,
      score: result.data.score,
      knowledgeGap: result.data.knowledgeGap,
      strongAreas: result.data.strongAreas,
      weakAreas: result.data.weakAreas,
    };
  }

  private extractJson(text: string): string {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    return (fenced?.[1] ?? text).trim();
  }
}
