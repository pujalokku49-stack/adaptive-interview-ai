import { Request, Response } from 'express';

import { IFeedbackGeneratorService } from '@application/services/IFeedbackGeneratorService';
import { SessionIdParams } from '@interfaces/http/validation/session.validation';

/**
 * Parses validated input, delegates to FeedbackGeneratorService,
 * and returns the HTTP JSON response. Errors propagate to central errorHandler.
 */
export class FinalFeedbackController {
  constructor(private readonly feedbackGeneratorService: IFeedbackGeneratorService) {}

  public getFinalFeedback = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params as unknown as SessionIdParams;

    const report = await this.feedbackGeneratorService.generate(sessionId);

    res.status(200).json({
      status: 'ok',
      data: report,
    });
  };
}
