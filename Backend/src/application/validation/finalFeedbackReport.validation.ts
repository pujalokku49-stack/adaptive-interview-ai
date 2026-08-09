import { z } from 'zod';

/**
 * Validates the LLM's parsed JSON response using Zod — applied here to
 * an untrusted LLM output instead of an HTTP request body ("parse, don't assume").
 */
export const topicScoreSchema = z.object({
  topic: z.string().min(1),
  score: z.number().min(0).max(10),
});

export const finalFeedbackReportSchema = z.object({
  candidateId: z.string().min(1),
  overallScore: z.number().min(0).max(10),
  topicScores: z.array(topicScoreSchema),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missedConcepts: z.array(z.string()),
  knowledgeGaps: z.array(z.string()),
  improvementSuggestions: z.array(z.string()),
  learningResources: z.array(z.string()),
  recommendedNextDifficulty: z.enum(['easy', 'medium', 'hard']),
});

export type ValidatedFinalFeedbackReport = z.infer<typeof finalFeedbackReportSchema>;
