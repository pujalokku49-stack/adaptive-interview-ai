import { Request, Response } from 'express';
import { IInterviewSpecService } from '@application/services/IInterviewSpecService';
import { InterviewSpecRequestBody } from '@interfaces/http/validation/interviewSpec.validation';

/**
 * Controller for Module 10: Standard Technical Specification Endpoint (POST /api/interview).
 * Delegates request processing to IInterviewSpecService and returns HTTP 200 response.
 */
export class InterviewSpecController {
  constructor(private readonly interviewSpecService: IInterviewSpecService) {}

  public handleInterview = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as InterviewSpecRequestBody;
    const result = await this.interviewSpecService.handleRequest(body);
    res.status(200).json(result);
  };
}
