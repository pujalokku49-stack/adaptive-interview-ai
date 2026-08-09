import { Request, Response } from 'express';

import { IInterviewPlannerService } from '@application/services/IInterviewPlannerService';
import { CandidateIdParams } from '@interfaces/http/validation/candidate.validation';

/**
 * Contains no business logic: parses already-validated input, delegates
 * to the planner service, and shapes the HTTP response. Errors are not
 * caught here — they propagate to asyncHandler -> centralized error
 * middleware.
 */
export class InterviewPlanController {
  constructor(private readonly interviewPlannerService: IInterviewPlannerService) {}

  public getPlan = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as unknown as CandidateIdParams;

    const plan = await this.interviewPlannerService.buildPlan(id);

    res.status(200).json({
      status: 'ok',
      data: plan,
    });
  };
}
