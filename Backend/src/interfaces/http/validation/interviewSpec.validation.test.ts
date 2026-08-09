import { interviewSpecRequestSchema } from '@interfaces/http/validation/interviewSpec.validation';

describe('interviewSpecRequestSchema', () => {
  it('accepts a valid session start payload with candidate object', () => {
    const validStartPayload = {
      sessionId: 'session-123',
      candidate: {
        id: 'CAND-001',
        fullName: 'Sarah Johnson',
      },
    };

    const result = interviewSpecRequestSchema.safeParse(validStartPayload);
    expect(result.success).toBe(true);
  });

  it('accepts a valid conversation turn payload with message string', () => {
    const validTurnPayload = {
      sessionId: 'session-123',
      message: 'I would build a query router using vector search embeddings.',
    };

    const result = interviewSpecRequestSchema.safeParse(validTurnPayload);
    expect(result.success).toBe(true);
  });

  it('rejects a payload with empty sessionId', () => {
    const invalidPayload = {
      sessionId: '',
      message: 'Hello',
    };

    const result = interviewSpecRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('rejects a payload missing both candidate and message', () => {
    const invalidPayload = {
      sessionId: 'session-123',
    };

    const result = interviewSpecRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it('rejects candidate payload with empty candidate id', () => {
    const invalidPayload = {
      sessionId: 'session-123',
      candidate: {
        id: '',
      },
    };

    const result = interviewSpecRequestSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
