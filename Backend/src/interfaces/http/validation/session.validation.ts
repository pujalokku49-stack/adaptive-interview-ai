import { z } from 'zod';

import { candidateIdParamSchema } from '@interfaces/http/validation/candidate.validation';

export const startSessionBodySchema = z.object({
  candidateId: candidateIdParamSchema.shape.id,
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid({ message: 'sessionId must be a valid UUID' }),
});

export const submitAnswerBodySchema = z.object({
  answer: z.string().trim().min(1, { message: 'answer must not be empty' }),
});

export type StartSessionBody = z.infer<typeof startSessionBodySchema>;
export type SessionIdParams = z.infer<typeof sessionIdParamSchema>;
export type SubmitAnswerBody = z.infer<typeof submitAnswerBodySchema>;
