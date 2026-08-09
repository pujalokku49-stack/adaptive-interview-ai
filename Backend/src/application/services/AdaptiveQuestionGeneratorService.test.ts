import { AdaptiveQuestionGeneratorService } from '@application/services/AdaptiveQuestionGeneratorService';
import { InterviewPlan } from '@domain/entities/InterviewPlan';
import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';

const plan: InterviewPlan = {
  candidateId: 'CAND-001',
  candidateName: 'Sarah Johnson',
  jobRole: 'Senior Data Engineer',
  gaps: [
    {
      day: 10,
      moduleTitle: 'Embeddings & Vector Search',
      dayTitle: 'The Retrieval & Matching Engine',
      reason: 'failed',
      objectives: ['Build a query router'],
    },
  ],
  strengths: [
    {
      day: 7,
      moduleTitle: 'Embeddings & Vector Search',
      dayTitle: 'Embeddings Explained',
      reason: 'strong_first_try',
      objectives: ['Generate embeddings for every knowledge base chunk'],
    },
  ],
  suggestedQuestions: [],
  generatedAt: '2026-01-01T00:00:00.000Z',
};

function evalEntry(overrides: Partial<QuestionEvaluation> = {}): QuestionEvaluation {
  return {
    question: 'Q',
    answer: 'A',
    evaluation: 'E',
    score: 8,
    knowledgeGap: [],
    strongAreas: [],
    weakAreas: [],
    ...overrides,
  };
}

describe('AdaptiveQuestionGeneratorService', () => {
  const generator = new AdaptiveQuestionGeneratorService();

  it('picks the first remaining topic at its baseline difficulty when there is no history', () => {
    const result = generator.generateNext({
      plan,
      remainingTopics: ['The Retrieval & Matching Engine', 'Embeddings Explained'],
      history: [],
      currentDifficulty: 'medium',
    });

    expect(result?.topic).toBe('The Retrieval & Matching Engine');
    expect(result?.difficulty).toBe('medium'); // 'failed' baseline
    expect(result?.isFollowUp).toBe(false);
  });

  it('returns null when there are no remaining topics and nothing to follow up on', () => {
    const result = generator.generateNext({
      plan,
      remainingTopics: [],
      history: [evalEntry({ score: 8, strongAreas: ['Embeddings Explained'] })],
      currentDifficulty: 'hard',
    });

    expect(result).toBeNull();
  });

  it('issues a follow-up on the same topic after a weak answer (score < 4)', () => {
    const result = generator.generateNext({
      plan,
      remainingTopics: ['Embeddings Explained'],
      history: [
        evalEntry({
          score: 2,
          knowledgeGap: ['The Retrieval & Matching Engine'],
          weakAreas: ['The Retrieval & Matching Engine'],
        }),
      ],
      currentDifficulty: 'medium',
    });

    expect(result?.isFollowUp).toBe(true);
    expect(result?.topic).toBe('The Retrieval & Matching Engine');
    expect(result?.difficulty).toBe('easy'); // stepped down from medium
  });

  it('does not follow up twice on the same topic (caps at one)', () => {
    const result = generator.generateNext({
      plan,
      remainingTopics: ['Embeddings Explained'],
      history: [
        evalEntry({
          score: 2,
          knowledgeGap: ['The Retrieval & Matching Engine'],
          weakAreas: ['The Retrieval & Matching Engine'],
        }),
        evalEntry({
          score: 2,
          knowledgeGap: ['The Retrieval & Matching Engine'],
          weakAreas: ['The Retrieval & Matching Engine'],
        }),
      ],
      currentDifficulty: 'easy',
    });

    expect(result?.isFollowUp).toBe(false);
    expect(result?.topic).toBe('Embeddings Explained');
  });

  it('steps difficulty up after a strong answer (score >= 8)', () => {
    const result = generator.generateNext({
      plan,
      remainingTopics: ['Embeddings Explained'],
      history: [evalEntry({ score: 9, strongAreas: ['The Retrieval & Matching Engine'] })],
      currentDifficulty: 'easy',
    });

    // Embeddings Explained baseline is 'hard' (strong_first_try); already
    // maxed, so stepping up keeps it at 'hard'.
    expect(result?.difficulty).toBe('hard');
    expect(result?.isFollowUp).toBe(false);
  });
});
