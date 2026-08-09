import { z } from 'zod';

/**
 * Request validation schema for Module 10: Standard Technical Specification API.
 * Validates payload structure for POST /api/interview.
 */
export const interviewSpecRequestSchema = z
  .object({
    sessionId: z.string().trim().min(1, { message: 'sessionId must be a non-empty string' }),
    candidate: z
      .object({
        id: z.string().trim().min(1, { message: 'candidate id must be a non-empty string' }),
        fullName: z.string().optional(),
        jobRole: z.string().optional(),
        yearsExperience: z.number().optional(),
        education: z.string().optional(),
        status: z.string().optional(),
        missions: z.array(z.any()).optional(),
        signals: z.any().optional(),
      })
      .optional(),
    message: z.string().optional(),
  })
  .refine((data) => data.candidate !== undefined || data.message !== undefined, {
    message: 'Payload must contain either a candidate object or a message string',
  });

export type InterviewSpecRequestBody = z.infer<typeof interviewSpecRequestSchema>;
