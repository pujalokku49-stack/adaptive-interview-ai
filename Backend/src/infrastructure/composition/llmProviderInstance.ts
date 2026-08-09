import { env } from '@infrastructure/config/env';
import { ILLMProvider } from '@domain/providers/ILLMProvider';
import { AnthropicLLMProvider } from '@infrastructure/llm/AnthropicLLMProvider';
import { OpenAILLMProvider } from '@infrastructure/llm/OpenAILLMProvider';
import { GeminiLLMProvider } from '@infrastructure/llm/GeminiLLMProvider';
import { RetryingLLMProvider } from '@infrastructure/llm/RetryingLLMProvider';

function createLLMProvider(): ILLMProvider {
  let baseProvider: ILLMProvider;

  switch (env.LLM_PROVIDER) {
    case 'openai':
      baseProvider = new OpenAILLMProvider();
      break;
    case 'gemini':
      baseProvider = new GeminiLLMProvider();
      break;
    case 'anthropic':
    default:
      baseProvider = new AnthropicLLMProvider();
      break;
  }

  // Wrap base provider with retry logic decorator
  return new RetryingLLMProvider(baseProvider);
}

export const llmProvider = createLLMProvider();
