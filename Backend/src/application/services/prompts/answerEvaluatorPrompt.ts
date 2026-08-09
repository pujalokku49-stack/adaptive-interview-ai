import { AnswerEvaluationInput } from '@application/services/IAnswerEvaluatorService';
import { LLMCompletionRequest } from '@domain/providers/ILLMProvider';

const RESPONSE_SCHEMA_DESCRIPTION = `{
  "question": string,
  "answer": string,
  "evaluation": string,
  "score": number (0-10),
  "knowledgeGap": string[],
  "strongAreas": string[],
  "weakAreas": string[]
}`;

/**
 * Builds system and user prompt for evaluating candidate interview answers.
 * Pure and framework/LLM-agnostic.
 */
export function buildAnswerEvaluationPrompt(input: AnswerEvaluationInput): LLMCompletionRequest {
  const system =
    'You are an expert technical interviewer evaluating a candidate answer. ' +
    'Evaluate technical correctness, depth, communication, and production reasoning. ' +
    'Respond ONLY with a single valid JSON object matching the exact schema below — no markdown code fences, ' +
    'no commentary, no extra keys, no trailing text.\n\n' +
    `Schema:\n${RESPONSE_SCHEMA_DESCRIPTION}`;

  const prompt = [
    `## Topic\n${input.topic}`,
    `## Difficulty Level\n${input.difficulty}`,
    `## Question Asked\n${input.question}`,
    `## Candidate Answer\n${input.answer}`,
    'Evaluate the answer now and produce the JSON object.',
  ].join('\n\n');

  return { system, prompt };
}
