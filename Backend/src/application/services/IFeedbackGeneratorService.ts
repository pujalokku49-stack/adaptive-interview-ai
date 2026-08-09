import { FinalFeedbackReport } from '@domain/entities/FinalFeedbackReport';

/**
 * The controller depends on this interface, not the concrete
 * FeedbackGeneratorService, keeping the interface-adapter layer decoupled
 * from application internals and trivially mockable in tests.
 */
export interface IFeedbackGeneratorService {
  generate(sessionId: string): Promise<FinalFeedbackReport>;
}
