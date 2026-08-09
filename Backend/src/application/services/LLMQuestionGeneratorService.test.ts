import { LLMQuestionGeneratorService } from '@application/services/LLMQuestionGeneratorService';
import {
  GeneratedQuestion,
  IQuestionGeneratorService,
  QuestionGenerationContext,
} from '@application/services/IQuestionGeneratorService';
import { InterviewPlan } from '@domain/entities/InterviewPlan';
import { ILLMProvider } from '@domain/providers/ILLMProvider';

const plan: InterviewPlan = {
  candidateId: 'CAND-001',
  candidateName: 'Sarah Johnson',
  jobRole: 'Senior Data Engineer',
  strengths: [],
  gaps: [],
  suggestedQuestions: [],
  generatedAt: '2026-01-01T00:00:00.000Z',
};

const sampleContext: QuestionGenerationContext = {
  plan,
  remainingTopics: ['Vector Search'],
  history: [],
  currentDifficulty: 'medium',
};

const validQuestionJson = JSON.stringify({
  topic: 'Vector Search',
  question: 'How do vector embeddings work?',
  difficulty: 'medium',
  isFollowUp: false,
});

const fallbackResult: GeneratedQuestion = {
  topic: 'Vector Search',
  question: 'Fallback question text',
  difficulty: 'medium',
  isFollowUp: false,
};

function createHarness(llmProvider: jest.Mocked<ILLMProvider>) {
  const fallbackGenerator: jest.Mocked<IQuestionGeneratorService> = {
    generateNext: jest.fn().mockReturnValue(fallbackResult),
  };

  const service = new LLMQuestionGeneratorService(llmProvider, fallbackGenerator);

  return { service, fallbackGenerator };
}

describe('LLMQuestionGeneratorService', () => {
  it('returns LLM-generated question when LLM returns valid JSON', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockResolvedValue({ text: validQuestionJson }),
    };
    const { service } = createHarness(llmProvider);

    const result = await service.generateNext(sampleContext);

    expect(result).not.toBeNull();
    expect(result?.question).toBe('How do vector embeddings work?');
    expect(result?.topic).toBe('Vector Search');
  });

  it('falls back to deterministic generator when LLM throws error', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockRejectedValue(new Error('LLM failure')),
    };
    const { service, fallbackGenerator } = createHarness(llmProvider);

    const result = await service.generateNext(sampleContext);

    expect(fallbackGenerator.generateNext).toHaveBeenCalledWith(sampleContext);
    expect(result?.question).toBe('Fallback question text');
  });
});
