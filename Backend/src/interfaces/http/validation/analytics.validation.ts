import { z } from 'zod';

export const analyticsCandidateParamSchema = z.object({
  candidateId: z.string().trim().min(1, { message: 'candidateId must be a non-empty string' }),
});

export type AnalyticsCandidateParam = z.infer<typeof analyticsCandidateParamSchema>;
