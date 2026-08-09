import { z } from 'zod';

/**
 * Zod validation schema for LLM-generated dynamic interview questions.
 * Applied to untrusted LLM JSON output to enforce schema safety ("parse, don't assume").
 */
export const generatedQuestionSchema = z.object({
  topic: z.string().min(1),
  question: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isFollowUp: z.boolean(),
});

export type ValidatedGeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
