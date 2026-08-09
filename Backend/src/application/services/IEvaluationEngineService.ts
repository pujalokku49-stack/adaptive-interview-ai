import { InterviewFeedback } from '@domain/entities/InterviewFeedback';
import { InterviewSession } from '@domain/entities/InterviewSession';

/**
 * The controller depends on this interface, not a concrete engine, so a
 * templated aggregator (today) can be swapped for an LLM-written summary
 * later without touching the controller.
 */
export interface IEvaluationEngineService {
  buildFeedback(session: InterviewSession): InterviewFeedback;
}
