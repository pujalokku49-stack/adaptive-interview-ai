import { QuestionGenerationContext } from '@application/services/IQuestionGeneratorService';
import { LLMCompletionRequest } from '@domain/providers/ILLMProvider';

const RESPONSE_SCHEMA_DESCRIPTION = `{
  "topic": string,
  "question": string,
  "difficulty": "easy" | "medium" | "hard",
  "isFollowUp": boolean
}`;

/**
 * Builds system and user prompt for dynamic LLM adaptive question generation.
 * Pure and framework/LLM-agnostic.
 */
export function buildQuestionGeneratorPrompt(context: QuestionGenerationContext): LLMCompletionRequest {
  const system =
    'You are a senior technical interviewer generating the next tailored interview question for a candidate. ' +
    'Consider their candidate profile, remaining curriculum topics, and previous answer evaluations. ' +
    'Respond ONLY with a single valid JSON object matching the exact schema below — no markdown code fences, ' +
    'no commentary, no extra keys, no trailing text.\n\n' +
    `Schema:\n${RESPONSE_SCHEMA_DESCRIPTION}`;

  const prompt = [
    `## Interview Plan Candidate\n${context.plan.candidateName} (${context.plan.jobRole})`,
    `## Current Difficulty\n${context.currentDifficulty}`,
    `## Remaining Topics Queue\n${JSON.stringify(context.remainingTopics)}`,
    `## Question Evaluation History\n${JSON.stringify(context.history, null, 2)}`,
    'Generate the next technical question JSON object now.',
  ].join('\n\n');

  return { system, prompt };
}
