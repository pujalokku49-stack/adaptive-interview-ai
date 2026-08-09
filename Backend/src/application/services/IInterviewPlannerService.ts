import { InterviewPlan } from '@domain/entities/InterviewPlan';

/**
 * The controller depends on this interface, not the concrete
 * InterviewPlannerService, keeping the interface-adapter layer decoupled
 * from application internals and trivially mockable in tests.
 */
export interface IInterviewPlannerService {
  buildPlan(candidateId: string): Promise<InterviewPlan>;
}
