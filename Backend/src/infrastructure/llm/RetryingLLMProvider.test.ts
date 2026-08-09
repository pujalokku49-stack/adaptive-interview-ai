import { RetryingLLMProvider } from '@infrastructure/llm/RetryingLLMProvider';
import { ILLMProvider } from '@domain/providers/ILLMProvider';

describe('RetryingLLMProvider', () => {
  it('succeeds immediately when inner provider succeeds', async () => {
    const mockProvider: ILLMProvider = {
      complete: jest.fn().mockResolvedValue({ text: 'success' }),
    };

    const retrying = new RetryingLLMProvider(mockProvider, 3, 1);
    const result = await retrying.complete({ system: 's', prompt: 'p' });

    expect(result.text).toBe('success');
    expect(mockProvider.complete).toHaveBeenCalledTimes(1);
  });

  it('retries up to maxRetries on failure and throws the last error', async () => {
    const mockProvider: ILLMProvider = {
      complete: jest.fn().mockRejectedValue(new Error('transient failure')),
    };

    const retrying = new RetryingLLMProvider(mockProvider, 3, 1);

    await expect(retrying.complete({ system: 's', prompt: 'p' })).rejects.toThrow(
      /transient failure/
    );
    expect(mockProvider.complete).toHaveBeenCalledTimes(3);
  });

  it('succeeds if a retry succeeds', async () => {
    const mockProvider: ILLMProvider = {
      complete: jest
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce({ text: 'recovered success' }),
    };

    const retrying = new RetryingLLMProvider(mockProvider, 3, 1);
    const result = await retrying.complete({ system: 's', prompt: 'p' });

    expect(result.text).toBe('recovered success');
    expect(mockProvider.complete).toHaveBeenCalledTimes(3);
  });
});
