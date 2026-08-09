import {
  GeneratedQuestion,
  IQuestionGeneratorService,
  QuestionGenerationContext,
} from '@application/services/IQuestionGeneratorService';
import { difficultyForFocusArea, questionForFocusArea } from '@application/services/interviewQuestionTemplates';
import { InterviewFocusArea, InterviewPlan } from '@domain/entities/InterviewPlan';
import { InterviewDifficulty } from '@domain/entities/InterviewSession';
import { QuestionEvaluation } from '@domain/entities/QuestionEvaluation';

const FOLLOW_UP_SCORE_THRESHOLD = 4;
const STEP_UP_SCORE_THRESHOLD = 8;

/**
 * Adapts the question sequence to the candidate's live performance:
 *  - A weak answer (score < 4) triggers one simpler follow-up on the same
 *    topic before moving on, capped at one follow-up per topic (checked by
 *    comparing the topic of the last two history entries) to avoid
 *    looping forever on a topic the candidate can't answer.
 *  - A strong answer (score >= 8) steps the difficulty up a notch for the
 *    next topic, on top of that topic's baseline difficulty.
 *  - Otherwise, advances through the plan's topic queue in order (gaps
 *    first, then strengths) at each topic's baseline difficulty.
 *
 * Template-based, no LLM dependency — the natural seam to swap in an
 * LLM-generated question later without changing SessionService's contract.
 */
export class AdaptiveQuestionGeneratorService implements IQuestionGeneratorService {
  public generateNext(context: QuestionGenerationContext): GeneratedQuestion | null {
    const { plan, remainingTopics, history, currentDifficulty } = context;
    const last = history[history.length - 1];

    if (last && last.score < FOLLOW_UP_SCORE_THRESHOLD) {
      const followUp = this.tryBuildFollowUp(plan, history, last, currentDifficulty);
      if (followUp) return followUp;
    }

    const nextTopic = remainingTopics[0];
    if (!nextTopic) return null;

    const area = this.findFocusArea(plan, nextTopic);
    if (!area) return null;

    let difficulty = difficultyForFocusArea(area);
    if (last && last.score >= STEP_UP_SCORE_THRESHOLD) {
      difficulty = this.stepUp(difficulty);
    }

    return {
      topic: area.dayTitle,
      question: questionForFocusArea(area),
      difficulty,
      isFollowUp: false,
    };
  }

  private tryBuildFollowUp(
    plan: InterviewPlan,
    history: QuestionEvaluation[],
    last: QuestionEvaluation,
    currentDifficulty: InterviewDifficulty
  ): GeneratedQuestion | null {
    const lastTopic = this.topicOf(last);
    if (!lastTopic) return null;

    const secondToLast = history[history.length - 2];
    const alreadyFollowedUp = secondToLast ? this.topicOf(secondToLast) === lastTopic : false;
    if (alreadyFollowedUp) return null;

    const area = this.findFocusArea(plan, lastTopic);
    if (!area) return null;

    return {
      topic: lastTopic,
      question: this.followUpQuestion(area),
      difficulty: this.stepDown(currentDifficulty),
      isFollowUp: true,
    };
  }

  private findFocusArea(plan: InterviewPlan, dayTitle: string): InterviewFocusArea | undefined {
    return [...plan.gaps, ...plan.strengths].find((area) => area.dayTitle === dayTitle);
  }

  /** Recovers which topic an evaluation was about from whichever bucket it landed in. */
  private topicOf(entry: QuestionEvaluation): string | undefined {
    return entry.knowledgeGap[0] ?? entry.weakAreas[0] ?? entry.strongAreas[0];
  }

  private followUpQuestion(area: InterviewFocusArea): string {
    const objective = area.objectives[0] ?? area.dayTitle;
    return `Let's stay on "${area.dayTitle}" for a moment — more simply: ${objective}. Can you walk me through just that part?`;
  }

  private stepDown(difficulty: InterviewDifficulty): InterviewDifficulty {
    return difficulty === 'hard' ? 'medium' : 'easy';
  }

  private stepUp(difficulty: InterviewDifficulty): InterviewDifficulty {
    return difficulty === 'easy' ? 'medium' : 'hard';
  }
}
