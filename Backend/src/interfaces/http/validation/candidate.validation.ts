import { z } from 'zod';

export const candidateIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[A-Z]+-\d+$/i, { message: 'Candidate id must match the format "CAND-001"' }),
});

export const listCandidatesQuerySchema = z.object({
  role: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CandidateIdParams = z.infer<typeof candidateIdParamSchema>;
export type ListCandidatesQuery = z.infer<typeof listCandidatesQuerySchema>;
