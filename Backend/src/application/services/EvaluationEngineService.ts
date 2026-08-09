import { IEvaluationEngineService } from '@application/services/IEvaluationEngineService';
import { InterviewFeedback } from '@domain/entities/InterviewFeedback';
import { InterviewSession } from '@domain/entities/InterviewSession';
import { AppError } from '@shared/errors/AppError';

const MAX_NEXT_STEPS = 5;

/**
 * Aggregates a completed session's per-question evaluations (Module 6)
 * into the final feedback shape the technical spec requires: a `summary`,
 * `strengths`, `gaps`, and `next` steps.
 *
 * Deduplicates strengths/gaps across the whole session and templates the
 * summary sentence — no LLM dependency. Swappable later for an
 * LLM-written summary via the same IEvaluationEngineService contract.
 */
export class EvaluationEngineService implements IEvaluationEngineService {
  public buildFeedback(session: InterviewSession): InterviewFeedback {
    if (session.status !== 'completed') {
      throw new AppError(`Session "${session.sessionId}" is not yet completed`, 409);
    }

    const strengths = this.unique(session.history.flatMap((entry) => entry.strongAreas));
    const gaps = this.unique([
      ...session.history.flatMap((entry) => entry.knowledgeGap),
      ...session.history.flatMap((entry) => entry.weakAreas),
    ]);

    const next =
      gaps.length > 0
        ? gaps.slice(0, MAX_NEXT_STEPS).map((gap) => `Review "${gap}" before your next technical round.`)
        : ['No major gaps identified — consider a deeper system-design round to probe further.'];

    return {
      summary: this.buildSummary(session, strengths, gaps),
      strengths,
      gaps,
      next,
    };
  }

  private buildSummary(session: InterviewSession, strengths: string[], gaps: string[]): string {
    const totalQuestions = session.history.length;
    const averageScore = totalQuestions > 0 ? session.score / totalQuestions : 0;
    const roundedAverage = Math.round(averageScore * 10) / 10;

    const strengthPart =
      strengths.length > 0 ? `Strongest on "${strengths[0]}".` : 'No standout strengths identified.';
    const gapPart = gaps.length > 0 ? `Most notable gap: "${gaps[0]}".` : 'No significant gaps identified.';

    return (
      `${session.candidateId} answered ${totalQuestions} question(s) across ` +
      `${session.topicsCovered.length} topic(s), averaging ${roundedAverage}/10. ` +
      `${strengthPart} ${gapPart}`
    );
  }

  private unique(items: string[]): string[] {
    return [...new Set(items)];
  }
}
