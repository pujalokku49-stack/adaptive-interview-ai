import { OpenAILLMProvider } from '@infrastructure/llm/OpenAILLMProvider';

describe('OpenAILLMProvider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('throws when no API key is configured', async () => {
    const provider = new OpenAILLMProvider(undefined, 'gpt-4o');

    await expect(provider.complete({ system: 's', prompt: 'p' })).rejects.toThrow(
      /OPENAI_API_KEY is not configured/
    );
  });

  it('throws when the API responds with a non-2xx status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('unauthorized'),
    }) as unknown as typeof fetch;

    const provider = new OpenAILLMProvider('fake-key', 'gpt-4o');

    await expect(provider.complete({ system: 's', prompt: 'p' })).rejects.toThrow(/status 401/);
  });

  it('throws when the API returns no text content', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ choices: [] }),
    }) as unknown as typeof fetch;

    const provider = new OpenAILLMProvider('fake-key', 'gpt-4o');

    await expect(provider.complete({ system: 's', prompt: 'p' })).rejects.toThrow(
      /returned no text content/
    );
  });

  it('extracts text content from a successful response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: '{"a":1}',
              },
            },
          ],
        }),
    }) as unknown as typeof fetch;

    const provider = new OpenAILLMProvider('fake-key', 'gpt-4o');

    const result = await provider.complete({ system: 's', prompt: 'p' });

    expect(result.text).toBe('{"a":1}');
  });
});
