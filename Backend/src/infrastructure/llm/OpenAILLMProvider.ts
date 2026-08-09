import { env } from '@infrastructure/config/env';
import { ILLMProvider, LLMCompletionRequest, LLMCompletionResult } from '@domain/providers/ILLMProvider';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MAX_TOKENS = 2000;

interface OpenAIChoice {
  message?: {
    content?: string;
  };
}

interface OpenAICompletionsResponse {
  choices?: OpenAIChoice[];
}

/**
 * Adapter over OpenAI's Chat Completions API implementing ILLMProvider.
 */
export class OpenAILLMProvider implements ILLMProvider {
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = arguments.length === 0 ? env.OPENAI_API_KEY : apiKey;
    this.model = model ?? env.OPENAI_MODEL;
  }

  public async complete(request: LLMCompletionRequest): Promise<LLMCompletionResult> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.prompt },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`OpenAI API request failed with status ${response.status}: ${body}`);
    }

    const data = (await response.json()) as OpenAICompletionsResponse;
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('OpenAI API returned no text content');
    }

    return { text };
  }
}
