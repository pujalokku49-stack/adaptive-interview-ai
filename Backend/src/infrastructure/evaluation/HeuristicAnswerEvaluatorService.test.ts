import { HeuristicAnswerEvaluatorService } from '@infrastructure/evaluation/HeuristicAnswerEvaluatorService';

describe('HeuristicAnswerEvaluatorService', () => {
  const evaluator = new HeuristicAnswerEvaluatorService();

  it('scores an empty/too-short answer as a full gap', async () => {
    const result = await evaluator.evaluate({
      question: 'Explain how embeddings work.',
      answer: 'idk',
      topic: 'Embeddings Explained',
      difficulty: 'easy',
    });

    expect(result.score).toBe(0);
    expect(result.knowledgeGap).toEqual(['Embeddings Explained']);
    expect(result.strongAreas).toEqual([]);
    expect(result.weakAreas).toEqual(['Embeddings Explained']);
  });

  it('scores a long, highly relevant answer as a strength', async () => {
    const question = 'Explain how you generate embeddings for knowledge base chunks';
    const answer =
      'To generate embeddings for knowledge base chunks I would explain the process end to end: ' +
      'first I split documents into chunks, then I generate embeddings for each chunk using a ' +
      'sentence transformer model, and finally I store the embeddings alongside metadata so they ' +
      'can be retrieved later during semantic search over the knowledge base.';

    const result = await evaluator.evaluate({
      question,
      answer,
      topic: 'Embeddings Explained',
      difficulty: 'easy',
    });

    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.strongAreas).toEqual(['Embeddings Explained']);
    expect(result.knowledgeGap).toEqual([]);
  });

  it('always echoes the original question and answer back in the record', async () => {
    const result = await evaluator.evaluate({
      question: 'Explain X',
      answer: 'This is a reasonably long answer about X and related concepts in some detail.',
      topic: 'Topic X',
      difficulty: 'medium',
    });

    expect(result.question).toBe('Explain X');
    expect(result.answer).toBe(
      'This is a reasonably long answer about X and related concepts in some detail.'
    );
  });

  it('applies a difficulty penalty on hard questions', async () => {
    const answer =
      'This is a moderately relevant answer with some overlap but not extensive depth here.';

    const easy = await evaluator.evaluate({
      question: 'Explain the topic',
      answer,
      topic: 'Topic',
      difficulty: 'easy',
    });
    const hard = await evaluator.evaluate({
      question: 'Explain the topic',
      answer,
      topic: 'Topic',
      difficulty: 'hard',
    });

    expect(hard.score).toBeLessThanOrEqual(easy.score);
  });
});
