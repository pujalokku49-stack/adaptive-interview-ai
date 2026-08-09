import { z } from 'zod';

/**
 * Zod validation schema for LLM-generated question answer evaluation responses.
 * Applied to untrusted LLM JSON output to enforce schema safety ("parse, don't assume").
 */
export const answerEvaluationSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  evaluation: z.string().min(1),
  score: z.number().min(0).max(10),
  knowledgeGap: z.array(z.string()),
  strongAreas: z.array(z.string()),
  weakAreas: z.array(z.string()),
});

export type ValidatedAnswerEvaluation = z.infer<typeof answerEvaluationSchema>;
