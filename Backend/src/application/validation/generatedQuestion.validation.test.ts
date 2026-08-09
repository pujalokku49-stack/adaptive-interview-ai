import { generatedQuestionSchema } from '@application/validation/generatedQuestion.validation';

const validQuestion = {
  topic: 'Vector Search',
  question: 'How do HNSW vector indexes optimize approximate nearest neighbor search?',
  difficulty: 'hard',
  isFollowUp: false,
};

describe('generatedQuestionSchema', () => {
  it('accepts a valid generated question object', () => {
    const result = generatedQuestionSchema.safeParse(validQuestion);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid difficulty level', () => {
    const result = generatedQuestionSchema.safeParse({ ...validQuestion, difficulty: 'extreme' });
    expect(result.success).toBe(false);
  });

  it('rejects an object missing required boolean isFollowUp', () => {
    const { isFollowUp, ...rest } = validQuestion;
    void isFollowUp;

    const result = generatedQuestionSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
