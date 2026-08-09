import {
  GeneratedQuestion,
  IQuestionGeneratorService,
  QuestionGenerationContext,
} from '@application/services/IQuestionGeneratorService';
import { buildQuestionGeneratorPrompt } from '@application/services/prompts/questionGeneratorPrompt';
import { generatedQuestionSchema } from '@application/validation/generatedQuestion.validation';
import { ILLMProvider } from '@domain/providers/ILLMProvider';
import { logger } from '@infrastructure/logger/logger';

/**
 * LLM-powered implementation of IQuestionGeneratorService.
 * Dynamically crafts adaptive interview questions and follow-ups using LLM synthesis
 * with Zod schema validation. Degrades gracefully to a deterministic fallback
 * generator (such as AdaptiveQuestionGeneratorService) if the LLM call or JSON parsing fails.
 */
export class LLMQuestionGeneratorService implements IQuestionGeneratorService {
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly fallbackGenerator: IQuestionGeneratorService
  ) {}

  public async generateNext(context: QuestionGenerationContext): Promise<GeneratedQuestion | null> {
    if (context.remainingTopics.length === 0 && context.history.length > 0) {
      // Check if last score requires a follow-up or if session queue is complete
      const last = context.history[context.history.length - 1];
      if (!last || last.score >= 4) {
        return null;
      }
    }

    try {
      const request = buildQuestionGeneratorPrompt(context);
      const completion = await this.llmProvider.complete(request);
      return this.parseAndValidate(completion.text);
    } catch (err) {
      logger.warn(
        { err, remainingTopics: context.remainingTopics.length },
        'LLM question generation failed — falling back to deterministic question generator'
      );
      return this.fallbackGenerator.generateNext(context);
    }
  }

  private parseAndValidate(rawText: string): GeneratedQuestion {
    const jsonText = this.extractJson(rawText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('LLM question generation response was not valid JSON');
    }

    const result = generatedQuestionSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(`LLM question generation schema validation failed: ${result.error.message}`);
    }

    return result.data;
  }

  private extractJson(text: string): string {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    return (fenced?.[1] ?? text).trim();
  }
}
