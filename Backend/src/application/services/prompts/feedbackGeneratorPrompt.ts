import { Candidate } from '@domain/entities/Candidate';
import { Curriculum } from '@domain/entities/Curriculum';
import { InterviewPlan } from '@domain/entities/InterviewPlan';
import { InterviewSession } from '@domain/entities/InterviewSession';
import { LLMCompletionRequest } from '@domain/providers/ILLMProvider';

export interface FeedbackPromptContext {
  candidate: Candidate;
  curriculum: Curriculum;
  plan: InterviewPlan;
  session: InterviewSession;
}

const RESPONSE_SCHEMA_DESCRIPTION = `{
  "candidateId": string,
  "overallScore": number (0-10),
  "topicScores": [{ "topic": string, "score": number (0-10) }],
  "strengths": string[],
  "weaknesses": string[],
  "missedConcepts": string[],
  "knowledgeGaps": string[],
  "improvementSuggestions": string[],
  "learningResources": string[],
  "recommendedNextDifficulty": "easy" | "medium" | "hard"
}`;

/**
 * Builds the system + user prompt for generating final interview feedback.
 * Pure and framework/LLM-agnostic — no calls, no I/O. Kept in its own
 * module (separate from FeedbackGeneratorService) so prompt wording can
 * be iterated on without touching orchestration, validation, or
 * fallback logic.
 *
 * Returns an {@link LLMCompletionRequest} so the caller can pass it
 * directly to any ILLMProvider without adaptation.
 */
export function buildFeedbackPrompt(context: FeedbackPromptContext): LLMCompletionRequest {
  const { candidate, curriculum, plan, session } = context;

  const system =
    'You are a senior technical interviewer producing structured final feedback for a completed ' +
    'candidate interview. Respond with ONLY a single valid JSON object matching the exact schema ' +
    'below — no markdown code fences, no commentary, no extra keys, no trailing text.\n\n' +
    `Schema:\n${RESPONSE_SCHEMA_DESCRIPTION}`;

  const sections = [
    `## Candidate Profile\n${JSON.stringify(
      {
        id: candidate.id,
        fullName: candidate.fullName,
        jobRole: candidate.jobRole,
        yearsExperience: candidate.yearsExperience,
        education: candidate.education,
      },
      null,
      2
    )}`,
    `## Cohort Curriculum\n${curriculum.cohort} — ${curriculum.modules.length} modules, ${curriculum.days.length} days`,
    `## Interview Plan\nGaps probed: ${JSON.stringify(
      plan.gaps.map((area) => ({ topic: area.dayTitle, reason: area.reason }))
    )}\nStrengths probed: ${JSON.stringify(
      plan.strengths.map((area) => ({ topic: area.dayTitle, reason: area.reason }))
    )}`,
    `## Interview State\n${JSON.stringify(
      {
        status: session.status,
        questionsAsked: session.questionsAsked,
        topicsCovered: session.topicsCovered,
        totalScore: session.score,
      },
      null,
      2
    )}`,
    `## Conversation History & Question Evaluations (in order asked)\n${JSON.stringify(
      session.history,
      null,
      2
    )}`,
    `Produce the final feedback JSON now for candidate "${candidate.id}".`,
  ];

  return { system, prompt: sections.join('\n\n') };
}
