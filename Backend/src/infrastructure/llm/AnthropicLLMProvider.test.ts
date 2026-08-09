import { AnthropicLLMProvider } from '@infrastructure/llm/AnthropicLLMProvider';

describe('AnthropicLLMProvider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('throws when no API key is configured', async () => {
    const provider = new AnthropicLLMProvider(undefined, 'claude-3-5-sonnet-20240620');

    await expect(provider.complete({ system: 's', prompt: 'p' })).rejects.toThrow(
      /ANTHROPIC_API_KEY is not configured/
    );
  });

  it('throws when the API responds with a non-2xx status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('unauthorized'),
    }) as unknown as typeof fetch;

    const provider = new AnthropicLLMProvider('fake-key', 'claude-3-5-sonnet-20240620');

    await expect(provider.complete({ system: 's', prompt: 'p' })).rejects.toThrow(/status 401/);
  });

  it('throws when the API returns no text content blocks', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ content: [] }),
    }) as unknown as typeof fetch;

    const provider = new AnthropicLLMProvider('fake-key', 'claude-3-5-sonnet-20240620');

    await expect(provider.complete({ system: 's', prompt: 'p' })).rejects.toThrow(
      /returned no text content/
    );
  });

  it('extracts and joins text content blocks from a successful response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          content: [
            { type: 'text', text: '{"a":1}' },
            { type: 'other' },
          ],
        }),
    }) as unknown as typeof fetch;

    const provider = new AnthropicLLMProvider('fake-key', 'claude-3-5-sonnet-20240620');

    const result = await provider.complete({ system: 's', prompt: 'p' });

    expect(result.text).toBe('{"a":1}');
  });
});
