import { answerEvaluationSchema } from '@application/validation/answerEvaluation.validation';

const validEvaluation = {
  question: 'Explain vector search embeddings',
  answer: 'Embeddings map text to high dimensional vectors',
  evaluation: 'Strong technical explanation with clear reasoning',
  score: 8.5,
  knowledgeGap: [],
  strongAreas: ['Vector Search'],
  weakAreas: [],
};

describe('answerEvaluationSchema', () => {
  it('accepts a valid answer evaluation object', () => {
    const result = answerEvaluationSchema.safeParse(validEvaluation);
    expect(result.success).toBe(true);
  });

  it('rejects a score below 0 or above 10', () => {
    const invalidLow = answerEvaluationSchema.safeParse({ ...validEvaluation, score: -1 });
    const invalidHigh = answerEvaluationSchema.safeParse({ ...validEvaluation, score: 11 });

    expect(invalidLow.success).toBe(false);
    expect(invalidHigh.success).toBe(false);
  });

  it('rejects an object missing array fields', () => {
    const { strongAreas, ...rest } = validEvaluation;
    void strongAreas;

    const result = answerEvaluationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
