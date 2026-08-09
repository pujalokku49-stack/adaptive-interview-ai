import { finalFeedbackReportSchema } from '@application/validation/finalFeedbackReport.validation';

const validReport = {
  candidateId: 'CAND-001',
  overallScore: 7.5,
  topicScores: [{ topic: 'Embeddings Explained', score: 8 }],
  strengths: ['Clear communication'],
  weaknesses: ['Query routing depth'],
  missedConcepts: ['Caching strategy'],
  knowledgeGaps: ['Vector index internals'],
  improvementSuggestions: ['Study ANN index structures'],
  learningResources: ['pgvector docs'],
  recommendedNextDifficulty: 'medium',
};

describe('finalFeedbackReportSchema', () => {
  it('accepts a well-formed report', () => {
    const result = finalFeedbackReportSchema.safeParse(validReport);

    expect(result.success).toBe(true);
  });

  it('rejects a score outside the 0-10 range', () => {
    const result = finalFeedbackReportSchema.safeParse({ ...validReport, overallScore: 15 });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid recommendedNextDifficulty value', () => {
    const result = finalFeedbackReportSchema.safeParse({
      ...validReport,
      recommendedNextDifficulty: 'extreme',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a report missing required array fields', () => {
    const { strengths, ...rest } = validReport;
    void strengths;

    const result = finalFeedbackReportSchema.safeParse(rest);

    expect(result.success).toBe(false);
  });

  it('rejects a malformed topicScores entry', () => {
    const result = finalFeedbackReportSchema.safeParse({
      ...validReport,
      topicScores: [{ topic: 'X', score: 'high' }],
    });

    expect(result.success).toBe(false);
  });
});
