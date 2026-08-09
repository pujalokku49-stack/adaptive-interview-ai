import { ILLMProvider, LLMCompletionRequest, LLMCompletionResult } from '@domain/providers/ILLMProvider';
import { logger } from '@infrastructure/logger/logger';

/**
 * Clean Architecture decorator wrapping any ILLMProvider to add robust retry behavior with exponential backoff.
 */
export class RetryingLLMProvider implements ILLMProvider {
  constructor(
    private readonly provider: ILLMProvider,
    private readonly maxRetries: number = 3,
    private readonly initialDelayMs: number = 500
  ) {}

  public async complete(request: LLMCompletionRequest): Promise<LLMCompletionResult> {
    let lastError: any;
    let delay = this.initialDelayMs;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.provider.complete(request);
      } catch (err: any) {
        lastError = err;
        logger.warn(
          { attempt, maxRetries: this.maxRetries, err: err.message },
          `LLM call failed, retrying in ${delay}ms...`
        );
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        }
      }
    }

    throw lastError;
  }
}
