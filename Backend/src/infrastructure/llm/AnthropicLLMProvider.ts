import { env } from '@infrastructure/config/env';
import { ILLMProvider, LLMCompletionRequest, LLMCompletionResult } from '@domain/providers/ILLMProvider';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MAX_TOKENS = 2000;

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessagesResponse {
  content?: AnthropicContentBlock[];
}

/**
 * Adapter over Anthropic's Messages API implementing ILLMProvider.
 * Configuration is injected at construction time (defaulting to the
 * centrally-validated env config) so the provider is trivially testable
 * without environment variable manipulation.
 */
export class AnthropicLLMProvider implements ILLMProvider {
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = arguments.length === 0 ? env.ANTHROPIC_API_KEY : apiKey;
    this.model = model ?? env.ANTHROPIC_MODEL;
  }

  public async complete(request: LLMCompletionRequest): Promise<LLMCompletionResult> {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: request.system,
        messages: [{ role: 'user', content: request.prompt }],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Anthropic API request failed with status ${response.status}: ${body}`);
    }

    const data = (await response.json()) as AnthropicMessagesResponse;

    const text = (data.content ?? [])
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text as string)
      .join('\n');

    if (!text) {
      throw new Error('Anthropic API returned no text content');
    }

    return { text };
  }
}
