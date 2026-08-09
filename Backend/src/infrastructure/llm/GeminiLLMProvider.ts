import { env } from '@infrastructure/config/env';
import { ILLMProvider, LLMCompletionRequest, LLMCompletionResult } from '@domain/providers/ILLMProvider';

/**
 * Adapter over Google's Gemini generateContent API implementing ILLMProvider.
 */
export class GeminiLLMProvider implements ILLMProvider {
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = arguments.length === 0 ? env.GEMINI_API_KEY : apiKey;
    this.model = model ?? env.GEMINI_MODEL;
  }

  public async complete(request: LLMCompletionRequest): Promise<LLMCompletionResult> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: request.prompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: request.system }],
        },
        generationConfig: {
          maxOutputTokens: request.maxTokens ?? 2000,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Gemini API request failed with status ${response.status}: ${body}`);
    }

    const data = (await response.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini API returned no text content');
    }

    return { text };
  }
}
