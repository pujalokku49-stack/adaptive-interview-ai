import { LLMAnswerEvaluatorService } from '@application/services/LLMAnswerEvaluatorService';
import {
  AnswerEvaluationInput,
  IAnswerEvaluatorService,
} from '@application/services/IAnswerEvaluatorService';
import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';
import { ILLMProvider } from '@domain/providers/ILLMProvider';

const sampleInput: AnswerEvaluationInput = {
  question: 'Walk me through query routing in vector databases',
  answer: 'Query routing splits queries into dense vector matching and BM25 hybrid ranking',
  topic: 'Vector Search',
  difficulty: 'hard',
};

const validEvaluationJson = JSON.stringify({
  question: sampleInput.question,
  answer: sampleInput.answer,
  evaluation: 'Deep, highly relevant technical answer',
  score: 9,
  knowledgeGap: [],
  strongAreas: ['Vector Search'],
  weakAreas: [],
});

const fallbackResult: QuestionEvaluation = {
  question: sampleInput.question,
  answer: sampleInput.answer,
  evaluation: 'Fallback evaluation',
  score: 6,
  knowledgeGap: [],
  strongAreas: ['Vector Search'],
  weakAreas: [],
};

function createHarness(llmProvider: jest.Mocked<ILLMProvider>) {
  const fallbackEvaluator: jest.Mocked<IAnswerEvaluatorService> = {
    evaluate: jest.fn().mockResolvedValue(fallbackResult),
  };

  const service = new LLMAnswerEvaluatorService(llmProvider, fallbackEvaluator);

  return { service, fallbackEvaluator };
}

describe('LLMAnswerEvaluatorService', () => {
  it('returns LLM-evaluated result when LLM returns valid JSON', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockResolvedValue({ text: validEvaluationJson }),
    };
    const { service } = createHarness(llmProvider);

    const result = await service.evaluate(sampleInput);

    expect(result.score).toBe(9);
    expect(result.evaluation).toBe('Deep, highly relevant technical answer');
    expect(result.strongAreas).toEqual(['Vector Search']);
  });

  it('strips markdown code fences before parsing', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockResolvedValue({ text: '```json\n' + validEvaluationJson + '\n```' }),
    };
    const { service } = createHarness(llmProvider);

    const result = await service.evaluate(sampleInput);
    expect(result.score).toBe(9);
  });

  it('falls back to deterministic evaluator when LLM throws error', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockRejectedValue(new Error('LLM API error')),
    };
    const { service, fallbackEvaluator } = createHarness(llmProvider);

    const result = await service.evaluate(sampleInput);

    expect(fallbackEvaluator.evaluate).toHaveBeenCalledWith(sampleInput);
    expect(result.score).toBe(6);
  });

  it('falls back to deterministic evaluator when LLM returns malformed JSON', async () => {
    const llmProvider: jest.Mocked<ILLMProvider> = {
      complete: jest.fn().mockResolvedValue({ text: 'invalid json' }),
    };
    const { service, fallbackEvaluator } = createHarness(llmProvider);

    const result = await service.evaluate(sampleInput);

    expect(fallbackEvaluator.evaluate).toHaveBeenCalledWith(sampleInput);
    expect(result.score).toBe(6);
  });
});
