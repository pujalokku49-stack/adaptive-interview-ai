import { InterviewFocusArea } from '@domain/entities/InterviewPlan';
import { InterviewDifficulty } from '@domain/entities/InterviewSession';

/**
 * Maps a focus-area's reason to a starting difficulty: unknown ground
 * (skipped/never attempted) starts easy to establish a baseline, a prior
 * failure is retested at medium, and a confirmed first-try strength is
 * pushed at hard to probe genuine depth.
 */
export function difficultyForFocusArea(area: InterviewFocusArea): InterviewDifficulty {
  switch (area.reason) {
    case 'strong_first_try':
      return 'hard';
    case 'failed':
      return 'medium';
    case 'skipped':
    case 'not_attempted':
    default:
      return 'easy';
  }
}

/**
 * Generates the question text for a given focus area. Intentionally
 * template-based for now (no LLM dependency) so session flow can be
 * exercised end-to-end; swappable later for an LLM-generated question
 * without changing SessionService's contract.
 */
export function questionForFocusArea(area: InterviewFocusArea): string {
  const objective = area.objectives[0] ?? area.dayTitle;

  switch (area.reason) {
    case 'failed':
      return `You had trouble passing "${area.dayTitle}" — walk me through: ${objective}. What would you do differently now?`;
    case 'skipped':
      return `You skipped "${area.dayTitle}" — how would you approach: ${objective}?`;
    case 'not_attempted':
      return `There's no record of you attempting "${area.dayTitle}" — explain how you'd tackle: ${objective}.`;
    case 'strong_first_try':
    default:
      return `You passed "${area.dayTitle}" on your first attempt — go deeper on how you handled: ${objective}.`;
  }
}
